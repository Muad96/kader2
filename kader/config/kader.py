from __future__ import unicode_literals
from frappe import _


def get_data():
    return [{
        "label":
        _("Employee and Attendance"),
        "items": [{
            "type": "doctype",
            "name": "Employee",
            "description": _("Employee"),
        }, {
            "type": "doctype",
            "name": "Attendance",
            "description": _("Attendance"),
        }, {
            "type": "doctype",
            "name": "Attendance Request",
            "description": _("Attendance Request"),
        }, {
            "type": "doctype",
            "name": "Joining Work",
            "description": _("Joining Work"),
        }]
    }, {
        "label":
        _("Leaves and Holiday"),
        "items": [{
            "type": "doctype",
            "name": "Leave Application",
            "description": _("Leave Application"),
        }, {
            "type": "doctype",
            "name": "Leave Allocation",
            "description": _("Leave Allocation"),
        }, {
            "type": "doctype",
            "name": "Leave Period",
            "description": _("Leave Period"),
        }, {
            "type": "doctype",
            "name": "Leave Type",
            "description": _("Leave Type"),
        }, {
            "type": "doctype",
            "name": "Holiday List",
            "description": _("Holiday List"),
        }, {
            "type": "doctype",
            "name": "Leave Block List",
            "description": _("Leave Block List"),
        }]
    }, {
        "label":
        _("Payroll"),
        "items": [{
            "type": "doctype",
            "name": "Payroll Entry",
            "description": _("Payroll Entry"),
        }, {
            "type": "doctype",
            "name": "Salary Slip",
            "description": _("Salary Slip"),
        }, {
            "type": "doctype",
            "name": "Salary Structure",
            "description": _("Salary Structure"),
        }, {
            "type": "doctype",
            "name": "Salary Structure Assignment",
            "description": _("Salary Structure Assignment"),
        }, {
            "type": "doctype",
            "name": "Additional Salary",
            "description": _("Additional Salary"),
        }, {
            "type": "doctype",
            "name": "Salary Component",
            "description": _("Salary Component"),
        }]
    }, {
        "label":
        _("Loan Management"),
        "items": [{
            "type": "doctype",
            "name": "Loan Application",
            "description": _("Loan Application"),
        }, {
            "type": "doctype",
            "name": "Loan",
            "label": _("Loan"),
            "description": _("Loan")
        }, {
            "type": "doctype",
            "name": "Loan Type",
            "label": _("Loan Type"),
            "description": _("Loan Type")
        }]
    }, {
        "label":
        _("Appraisals"),
        "items": [{
            "type": "doctype",
            "name": "Appraisal",
            "description": _("Appraisal"),
        }, {
            "type": "doctype",
            "name": "Appraisal Template",
            "description": _("Appraisal Template"),
        }]
    }, {
        "label":
        _("Recruitment"),
        "items": [{
            "type": "doctype",
            "name": "Job Opening",
            "description": _("Job Opening"),
        }, {
            "type": "doctype",
            "name": "Job Applicant",
            "description": _("Job Applicant"),
        }, {
            "type": "doctype",
            "name": "Job Offer",
            "description": _("Job Offer"),
        }]
    }, {
        "label":
        _("Employee Lifecycle"),
        "items": [{
            "type": "doctype",
            "name": "Employee Transfer",
            "description": _("Employee Transfer"),
        }, {
            "type": "doctype",
            "name": "Employee Promotion",
            "description": _("Employee Promotion"),
        }, {
            "type": "doctype",
            "name": "Vacation Settlement",
            "description": _("Vacation Settlement"),
        }, {
            "type": "doctype",
            "name": "End of Service Settlement",
            "description": _("End of Service Settlement"),
        }]
    },  {
        "label":
        _("Violation"),
        "items": [{
            "type": "doctype",
            "name": "Violation",
            "label": _("labour Office Violation"),
            "description": _("labour Office Violation"),
        }, {
            "type": "doctype",
            "name": "Violation Type",
            "description": _("Violation Type"),
        }, {
            "type": "doctype",
            "name": "Attendance Violation",
            "description": _("Attendance Violation"),
        }]
    },  {
        "label":
        _("Insurance"),
        "items": [{
            "type": "doctype",
            "name": "Employee Health Insurance",
            "description": _("Employee Health Insurance"),
        }, {
            "type": "doctype",
            "name": "Vehicle Insurance",
            "description": _("Vehicle Insurance Provider"),
        }, {
            "type": "report",
            "label": _("Employee Insurance Table"),
            "name": "Employee Insurance",
            "doctype": "Employee"
        }, {
            "type": "report",
            "label": _("Vehicle Insurance Table"),
            "name": "Vehicle Insurance",
            "doctype": "Vehicle"
        }, {
            "type": "doctype",
            "name": "Property and Facility",
            "description": _("Property and Facility"),
        }, {
            "type": "doctype",
            "name": "Property Insurance Criteria",
            "description": _("Property Insurance Criteria"),
        }]
    }, {
        "label":
        _("Custodies and Telecom"),
        "items": [{
            "type": "doctype",
            "name": "Custody",
            "description": _("Custody"),
        },  {
            "type": "doctype",
            "name": "Custody Type",
            "description": _("Custody Type"),
        },  {
            "type": "doctype",
            "name": "Custody Log",
            "description": _("Custody Log"),
        }, {
            "type": "doctype",
            "name": "Devices",
            "description": _("Devices"),
        }, {
            "type": "doctype",
            "label": _("SIM Cards & Connections"),
            "name": "Telecom",
            "description": _("SIM Cards & Connections"),
        }, {
            "type": "doctype",
            "name": "Common Item",
            "description": _("Common Item"),
        }, {
            "type": "doctype",
            "name": "Software Licenses",
            "description": _("Software Licenses"),
        }]
    }, {
        "label":
        _("Training"),
        "items": [{
            "type": "doctype",
            "name": "Training Program",
            "description": _("Training Program"),
        },  {
            "type": "doctype",
            "name": "Training Event",
            "description": _("Training Event"),
        },  {
            "type": "doctype",
            "name": "Training Result",
            "description": _("Training Result"),
        }, {
            "type": "doctype",
            "name": "Training Feedback",
            "description": _("Training Feedback"),
        }]
    }, {
        "label":
        _("Reports"),
        "items": [{
            "type": "report",
            "label": _("Employee Information"),
            "name": "Employee Information",
            "doctype": "Employee"
        },  {
            "type": "report",
            "label": _("Employee Leave Balance"),
            "name": "Employee Leave Balance",
            "doctype": "Employee"
        },  {
            "type": "report",
            "label": _("Employee Email"),
            "name": "Employee Email",
            "doctype": "Employee"
        }, {
            "type": "report",
            "label": _("Employee Mandatory List"),
            "name": "Employee Mandatory List",
            "doctype": "Employee"
        }, {
            "type": "report",
            "label": _("Employee Salary"),
            "name": "Employee Salary",
            "doctype": "Employee"
        }, {
            "type": "report",
            "label": _("Employee Salary"),
            "name": "Employee Salary",
            "doctype": "Employee"
        }]
    }]
