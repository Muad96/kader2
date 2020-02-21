from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, today, getdate, add_years, date_diff
from frappe.model.document import Document


def get_company_abbr(company):
    return frappe.db.sql("select abbr from tabCompany where name=%s",
                         company)[0][0]


def get_bool(val):
    if (val == "true"):
        return True
    else:
        return False


def get_default_payroll_payable_account(self):
    payroll_payable_account = frappe.db.get_value("Company",
                                                  {"company_name": self.company}, "default_payroll_payable_account")

    if not payroll_payable_account:
        frappe.throw(_("Please set Default Payroll Payable Account in Company {0}")
                     .format(self.company))
    return payroll_payable_account


@frappe.whitelist()
def insert_email_alert(insert_list, document_type):
    insert_list = json.loads(insert_list)
    for state_row in insert_list:
        for key, value in state_row.iteritems():
            print ("{0} = {1}".format(key, value))
            if (key == "state"):
                state = value
            if (key == "email_by_role"):
                email_by_role = value
            if (key == "email_by_document_field"):
                email_by_document_field = value
            if (key == "subject"):
                subject = value
            if (key == "message"):
                message = value
        print ("---------------------")
        print ("state = {0} email_by_role = {1} message = {2}".format(
            state, email_by_role, message))
        doc = frappe.get_doc({
            "doctype":
            "Email Alert",
            "enabled":
            1,
            "name":
            document_type + " - " + state,
            "subject":
            subject,
            "document_type":
            document_type,
            "event":
            "Value Change",
            "value_changed":
            "workflow_state",
            "condition":
            "doc.workflow_state == '" + state + "'",
            "message":
            message
        })
        recip = frappe.get_doc({
            "doctype":
            "Email Alert Recipient",
            "email_by_document_field":
            email_by_document_field,
            "email_by_role":
            email_by_role,
            "condition":
            "doc.workflow_state == '" + state + "'"
        })
        doc.append("recipients", recip)
        doc.insert()
    frappe.msgprint(_("Email Alert is done"))


@frappe.whitelist()
def add_signature(value, document_type):
    frappe.get_doc({
        "doctype": "Custom Field",
        "dt": document_type,
        "__islocal": 1,
        "fieldname": "signatures",
        "label": "Signatures",
        "allow_on_submit": 1,
        "fieldtype": "HTML",
        "hidden": 1,
        "options": value,
        "idx": 100
    }).save()
    frappe.msgprint(
        _("Created Custom Field signatures in {0}").format(document_type))


@frappe.whitelist()
def add_rejected_field(document_type):
    frappe.get_doc({
        "doctype": "Custom Field",
        "dt": document_type,
        "__islocal": 1,
        "fieldname": "rejected_reason",
        "label": "Rejected Reason",
        "allow_on_submit": 1,
        "fieldtype": "Small Text",
        "read_only": 1,
        "depends_on": "eval:doc.workflow_state == 'Rejected'",
        "idx": 150
    }).save()
    frappe.msgprint(
        _("Created Custom Field Rejected Reason in {0}").format(document_type))

# Get email addresses of all users that have been assigned this role


@frappe.whitelist()
def get_emails_from_role(role):
    emails = []

    users = frappe.get_list(
        "Has Role",
        filters={"role": role,
                 "parenttype": "User"},
        fields=["parent"])

    for user in users:
        user_email = frappe.db.get_value("User", user.parent, "email")
        emails.append(user_email)

    return emails


@frappe.whitelist()
def add_salary_structure(doc, method):
    ss = frappe.get_doc({
        "name":
        doc.employee_name,
        "doctype":
        "Salary Structure",
        "company":
        doc.company,
        "is_active":
        "Yes",
        "payroll_frequency":
        "Monthly",
        "is_default":
        "Yes",
        "payment_account":
        get_default_payroll_payable_account(doc),
        "employees": [{
            "docstatus": 0,
            "doctype": "Salary Structure Employee",
            "name": "New Salary Structure Employee 1",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "parent": "New Salary Structure 1",
            "parentfield": "employees",
            "parenttype": "Salary Structure",
            "idx": 1,
            "company": doc.company,
            "employee_name": doc.employee_name,
            "employee": doc.name,
            "from_date": today(),
            "base": 0,
            "to_date": add_years(today(), 1)
        }],
        "earnings": [{
            "docstatus": 0,
            "doctype": "Salary Detail",
            "name": "New Salary Detail 1",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "amount_based_on_formula": 1,
            "parent": "New Salary Structure 1",
            "parentfield": "earnings",
            "parenttype": "Salary Structure",
            "idx": 1,
            "__unedited": 0,
            "abbr": "B",
            "salary_component": "Basic",
            "amount": 0
        }, {
            "docstatus": 0,
            "doctype": "Salary Detail",
            "name": "New Salary Detail 2",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "amount_based_on_formula": 1,
            "parent": "New Salary Structure 3",
            "parentfield": "earnings",
            "parenttype": "Salary Structure",
            "idx": 2,
            "__unedited": 0,
            "abbr": "H",
            "salary_component": "Housing",
            "formula": "B * .25"
        }, {
            "docstatus": 0,
            "doctype": "Salary Detail",
            "name": "New Salary Detail 3",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "amount_based_on_formula": 1,
            "parent": "New Salary Structure 4",
            "parentfield": "earnings",
            "parenttype": "Salary Structure",
            "idx": 2,
            "__unedited": 0,
            "abbr": "TA",
            "salary_component": "Transportation",
            "formula": "B * .10"
        }],
        "deductions": [{
            "docstatus": 0,
            "doctype": "Salary Detail",
            "name": "New Salary Detail 1",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "amount_based_on_formula": 1,
            "parent": "New Salary Structure 1",
            "parentfield": "deductions",
            "parenttype": "Salary Structure",
            "idx": 1,
            "__unedited": 0,
            "abbr": "GOSI",
            "salary_component": "GOSI",
            "formula": "B *.09"
        }, {
            "docstatus": 0,
            "doctype": "Salary Detail",
            "name": "New Salary Detail 5",
            "__islocal": 1,
            "__unsaved": 1,
            "owner": frappe.session.user,
            "amount_based_on_formula": 1,
            "parent": "New Salary Structure 1",
            "parentfield": "deductions",
            "parenttype": "Salary Structure",
            "idx": 2,
            "__unedited": 0,
            "abbr": "SAND",
            "salary_component": "SAND",
            "formula": "B *.01"
        }]
    }).insert()


@frappe.whitelist()
def set_salary_structure_for_all(doc):
    employees = frappe.get_list(
        "Employee", filters={"status": "Active"}, fields=["*"])
    for emp in employees:
        ss = frappe.get_doc({
            "name":
            emp.employee_name,
            "doctype":
            "Salary Structure",
            "company":
            doc.company,
            "is_active":
            "Yes",
            "payroll_frequency":
            "Monthly",
            "is_default":
            "Yes",
            "payment_account":
            get_default_payroll_payable_account(doc),
            "employees": [{
                "docstatus": 0,
                "doctype": "Salary Structure Employee",
                "name": "New Salary Structure Employee 1",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "parent": "New Salary Structure 1",
                "parentfield": "employees",
                "parenttype": "Salary Structure",
                "idx": 1,
                "company": doc.company,
                "employee_name": emp.employee_name,
                "employee": emp.name,
                "from_date": today(),
                "base": 0,
                "to_date": add_years(today(), 1)
            }],
            "earnings": [{
                "docstatus": 0,
                "doctype": "Salary Detail",
                "name": "New Salary Detail 1",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "amount_based_on_formula": 1,
                "parent": "New Salary Structure 1",
                "parentfield": "earnings",
                "parenttype": "Salary Structure",
                "idx": 1,
                "__unedited": 0,
                "abbr": "B",
                "salary_component": "Basic",
                "amount": 0
            }, {
                "docstatus": 0,
                "doctype": "Salary Detail",
                "name": "New Salary Detail 2",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "amount_based_on_formula": 1,
                "parent": "New Salary Structure 1",
                "parentfield": "earnings",
                "parenttype": "Salary Structure",
                "idx": 2,
                "__unedited": 0,
                "abbr": "H",
                "salary_component": "Housing",
                "formula": "B * .25"
            }, {
                "docstatus": 0,
                "doctype": "Salary Detail",
                "name": "New Salary Detail 3",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "amount_based_on_formula": 1,
                "parent": "New Salary Structure 1",
                "parentfield": "earnings",
                "parenttype": "Salary Structure",
                "idx": 2,
                "__unedited": 0,
                "abbr": "TA",
                "salary_component": "Transportation",
                "formula": "B * .10"
            }],
            "deductions": [{
                "docstatus": 0,
                "doctype": "Salary Detail",
                "name": "New Salary Detail 5",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "amount_based_on_formula": 1,
                "parent": "New Salary Structure 1",
                "parentfield": "deductions",
                "parenttype": "Salary Structure",
                "idx": 1,
                "__unedited": 0,
                "abbr": "GOSI",
                "salary_component": "GOSI",
                "formula": "B *.09"
            }, {
                "docstatus": 0,
                "doctype": "Salary Detail",
                "name": "New Salary Detail 6",
                "__islocal": 1,
                "__unsaved": 1,
                "owner": frappe.session.user,
                "amount_based_on_formula": 1,
                "parent": "New Salary Structure 1",
                "parentfield": "deductions",
                "parenttype": "Salary Structure",
                "idx": 2,
                "__unedited": 0,
                "abbr": "SAND",
                "salary_component": "SAND",
                "formula": "B *.01"
            }]
        }).insert()
    frappe.msgprint(_("Salary Structure is added to all Employees"))


@frappe.whitelist()
def add_timesheet_summary(project):
    sheetList = frappe.get_list("Timesheet",
                                fields=["name", "total_billable_hours",
                                        "total_billable_amount", "status"],
                                filters={
                                    "project": project,
                                    "status": "Submitted"
                                })
    return sheetList

@frappe.whitelist()
def get_deductions(start, end):
    deductions = frappe.get_list("Deduction", fields=["*"], filters={"docstatus":"1",
        "posting_date": ["between", [start, end]]})
    return deductions
    

@frappe.whitelist()
def get_appraisal(start, end):
    appraisal = frappe.get_list("Appraisal", fields=["*"], filters={"docstatus":"1",
        "start_date": ["between", [start, end]]})
    return appraisal

@frappe.whitelist()
def get_employee_deduction(employee,start_date, end_date):
    deductions = frappe.get_list("Deduction", fields=["*"], filters={"docstatus":"1","employee":employee,
        "posting_date": ["between", [start_date, end_date]]})
    return deductions


@frappe.whitelist()
def add_violation_to_salaryslip(posting_date, start, end):
    deductions = get_deductions(start, end)
    print ("v = {}".format(frappe.as_json(deductions)))
    for d in deductions:
        ss = frappe.get_list("Salary Slip", fields=["*"], filters={
            "posting_date": posting_date, "status": "draft", "employee": d.employee})[0]
        print ("ss name = {}".format(ss.name))
        print ("v.amount = {}".format(d.amount))
        sd = frappe.get_doc({"doctype": "Salary Detail",
                             "salary_component": "مخالفة عمل", "amount": d.amount})
        salary = frappe.get_doc({"Salary Slip", ss.name})
        salary.append("deductions", sd)
        salary.save()
        frappe.db.commit()
    frappe.msgprint(_("Violation deductions is added to all Salary Slip"))


@frappe.whitelist()
def add_Appraisal_to_salaryslip(posting_date, start, end):
    appraisal = get_appraisal(start, end)
    print ("v = {}".format(frappe.as_json(appraisal)))
    for d in appraisal:
        ss = frappe.get_list("Salary Slip", fields=["*"], filters={
            "posting_date": posting_date, "status": "draft", "employee": d.employee})[0]
        print ("ss name = {}".format(ss.name))
        print ("v.amount = {}".format(d.total_score))
        salary = frappe.get_doc("Salary Slip", ss.name)
        salary.appraisal = d.name
        salary.performance = d.total_score
        salary.save()
        frappe.db.commit()
    frappe.msgprint(_("Appraisal Score is added to all Salary Slip"))


@frappe.whitelist()
def get_salary(employee, start_date, end_date):
    doc = frappe.get_doc({"doctype": "Salary Slip", "employee": employee,
                          "start_date": start_date, "end_date": end_date, "payroll_frequency": "Monthly"})
    doc.get_emp_and_leave_details()
    if doc.gross_pay is not None:
        return doc
    else:
        frappe.throw(
            _("Please create Salary Structure for employee {}".format(employee)))


@frappe.whitelist()
def get_full_salary(employee, start_date, end_date):
    doc = frappe.get_doc({"doctype": "Full Salary", "employee": employee,
                          "start_date": start_date, "end_date": end_date, "payroll_frequency": "Monthly"})
    doc.get_emp_and_leave_details()
    if doc.gross_pay is not None:
        return doc
    else:
        frappe.throw(
            _("Please create Salary Structure for employee {}".format(employee)))

@frappe.whitelist()
def get_daily_rate(employee, start_date, end_date):
    doc = get_full_salary(employee, start_date, end_date)
    month_days = date_diff(end_date, start_date) + 1
    return doc.gross_pay / month_days


@frappe.whitelist()
def get_basic_salary(employee, start_date, end_date):
    doc = get_full_salary(employee, start_date, end_date)
    return doc.earnings[0].amount


@frappe.whitelist()
def get_month_days(employee, start_date, end_date):
    doc = frappe.get_doc({"doctype": "Salary Slip", "employee": employee,
                          "start_date": start_date, "end_date": end_date, "payroll_frequency": "Monthly"})
    doc.get_emp_and_leave_details()
    month_days = date_diff(doc.end_date, doc.start_date) + 1
    return month_days


@frappe.whitelist()
def get_last_joining(employee):
    d = frappe.get_all("Joining Work", ["name"],filters={"employee":employee}, order_by="creation desc", limit_page_length=1)
    if d:
        return frappe.get_doc("Joining Work", d[0].name)

@frappe.whitelist()
def get_leave_without_pay(employee):
    total_lwp = 0
    lwp_list = frappe.get_all("Leave Application", ["name","total_leave_days"],
    filters={"employee":employee,"leave_type":"إجازة غير مدفوعة","docstatus": "1"})

    for lwp in lwp_list:
        total_lwp = total_lwp + lwp.total_leave_days
    return total_lwp

@frappe.whitelist()
def get_last_settlement(doctype,employee):
    last_settlement = frappe.get_all(doctype, "name", filters={"employee":employee,"docstatus": "1"},
    order_by="creation desc", limit_page_length=1)
    if last_settlement:
        return frappe.get_doc(doctype, last_settlement[0].name)
