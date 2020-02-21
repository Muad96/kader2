# -*- coding: utf-8 -*-
# Copyright (c) 2019, KABCO and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from kader.kader.tools import get_daily_rate
from frappe.utils import get_first_day, getdate, add_months, get_last_day


class Violation(Document):

    def before_insert(self):
        def make_deduction(action):
            daily = get_daily_rate(self.employee,
                                   get_first_day(self.posting_date),
                                   get_last_day(self.posting_date))
            print ("daily = {}".format(daily))
            if action == "One day":
                self.deduction = daily
            elif action == "Two days":
                self.deduction = daily * 2
            elif action == "Three days":
                self.deduction = daily * 3
            elif action == "Five days":
                self.deduction = daily * 5
            elif action == "5%":
                self.deduction = daily * .05
            elif action == "10%":
                self.deduction = daily * .10
            elif action == "15%":
                self.deduction = daily * .15
            elif action == "20%":
                self.deduction = daily * .20
            elif action == "25%":
                self.deduction = daily * .25
            elif action == "50%":
                self.deduction = daily * .50
            elif action == "75%":
                self.deduction = daily * .75

        violation_list = frappe.get_list(
            "Violation",
            filters={
                "employee":
                self.employee,
                "violation_type":
                self.violation_type,
                "posting_date": [
                    "between",
                    [
                        add_months(self.posting_date,
                                   -6),  # to check last 6 months
                        self.posting_date
                    ]
                ]
            },
            order_by="posting_date")

        count = len(violation_list)
        count = count + 1
        self.frequency_count = count
        if self.frequency_count == 1:
            self.action = frappe.db.get_value('Violation Type',
                                              self.violation_type, "first")
        elif self.frequency_count == 2:
            self.action = frappe.db.get_value('Violation Type',
                                              self.violation_type, "second")
        elif self.frequency_count == 3:
            self.action = frappe.db.get_value('Violation Type',
                                              self.violation_type, "third")
        elif self.frequency_count == 4:
            self.action = frappe.db.get_value('Violation Type',
                                              self.violation_type, "fourth")
        else:
            self.action = frappe.db.get_value('Violation Type',
                                              self.violation_type, "fourth")
        make_deduction(self.action)

    def after_insert(self):
        def create_new_additional_salary(self):
            doc = frappe.get_doc({
                "doctype": "Additional Salary",
                "employee": self.employee,
                "employee_name": self.employee_name,
                "company": self.company,
                "payroll_date": self.posting_date,
                "salary_component": "مخالفة عمل",
                "violation":self.name,
                "violation_type":self.violation_type,
                "remarks": self.note,
                "amount": self.deduction,
                "overwrite_salary_structure_amount": 1
            })
            doc.insert()
            doc.submit()
            return doc

        deduc = frappe.get_list(
            "Additional Salary",
            fields=["name"],
            order_by=self.posting_date,
            filters={
                "docstatus":1,
                "payroll_date": [
                    "Between", [
                        get_first_day(self.posting_date),
                        get_last_day(self.posting_date)
                    ]
                ],
                "violation_type":
                self.violation_type,
                "employee":
                self.employee
            })

        if deduc:
            doc = deduc[0]
            print ("doc.name = {}".format(doc.name))
            additional_salary = frappe.get_doc("Additional Salary", doc.name)
            additional_salary.cancel()
            doc = additional_salary(self)
        elif self.deduction:
            create_new_additional_salary(self)

    #def validate(self):
       # additional_salary = frappe.get_list("Additional Salary",filters={"violation":self.name})[0]
        #additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
        #additional_salary.submit()

    def on_cancel(self):
        additional_salary = frappe.get_list("Additional Salary",filters={"violation":self.name})[0]
        additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
        additional_salary.cancel()

    def on_trash(self):
        if self.deduction < 0:
            additional_salary = frappe.get_list("Additional Salary",filters={"violation":self.name})[0]
            additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
            additional_salary.delete()