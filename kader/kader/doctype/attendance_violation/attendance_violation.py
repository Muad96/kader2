# -*- coding: utf-8 -*-
# Copyright (c) 2019, KABCO and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document
from erpnext.hr.utils import set_employee_name
from kader.kader.tools import get_daily_rate, get_basic_salary, get_month_days
from frappe.utils import get_first_day, getdate, add_months, get_last_day, date_diff


class AttendanceViolation(Document):
    def before_insert(self):
        def make_deduction(deduction_based_on):
            month_days = get_month_days (
                self.employee,
                get_first_day(self.posting_date),
                get_last_day(self.posting_date),
            )

            basic_salary = self.salary_no_housing
            print("basic_salary = {}".format(basic_salary))
            if deduction_based_on == "Day":
                self.deduction = (basic_salary * self.count) / month_days
            elif deduction_based_on == "Minutes":
                self.deduction = (basic_salary/(self.duty_hours * 60 * month_days)) * self.count

        make_deduction(self.deduction_based_on)

    def on_submit(self):
        def create_new_additional_salary(self):

            if self.deduction_based_on == "Day":
                doc = frappe.get_doc(
					{
						"doctype": "Additional Salary",
						"employee": self.employee,
						"employee_name": self.employee_name,
						"company": self.company,
						"payroll_date": self.posting_date,
						"salary_component": "غياب",
						"attendance_violation": self.name,
						"remarks": self.note,
						"amount": self.deduction,
						"overwrite_salary_structure_amount": 1,
					}
				)

            elif self.deduction_based_on == "Minutes":
                doc = frappe.get_doc(
                {
                    "doctype": "Additional Salary",
                    "employee": self.employee,
                    "employee_name": self.employee_name,
                    "company": self.company,
                    "payroll_date": self.posting_date,
                    "salary_component": "تأخر ساعات عمل",
                    "attendance_violation": self.name,
                    "remarks": self.note,
                    "amount": self.deduction,
                    "overwrite_salary_structure_amount": 1,
                }
            )

            doc.insert()
            doc.submit()
            return doc

        deduc = frappe.get_list(
            "Additional Salary",
            fields=["name"],
            order_by=self.posting_date,
            filters={
                "docstatus": 1,
                "payroll_date": [
                    "Between",
                    [get_first_day(self.posting_date), get_last_day(self.posting_date)],
                ],
                "employee": self.employee,
            },
        )

        # if deduc:
          #   doc = deduc[0]
          #   print("doc.name = {}".format(doc.name))
          #   additional_salary = frappe.get_doc("Additional Salary", doc.name)
          #   additional_salary.cancel()
          #   doc = additional_salary(self)
        # elif self.deduction:
        create_new_additional_salary(self)

    # def validate(self):
    # additional_salary = frappe.get_list("Additional Salary",filters={"violation":self.name})[0]
    # additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
    # additional_salary.submit()

    def on_cancel(self):
        if self.deduction < 0:
            additional_salary = frappe.get_list(
                "Additional Salary", filters={"attendance_violation": self.name}
            )[0]
            additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
            additional_salary.cancel()

    def on_trash(self):
        if self.deduction < 0:
            additional_salary = frappe.get_list(
                "Additional Salary", filters={"attendance_violation": self.name}
            )[0]
            additional_salary = frappe.get_doc(
                "Additional Salary", additional_salary.name
            )
            additional_salary.delete()
