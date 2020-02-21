# -*- coding: utf-8 -*-
# Copyright (c) 2019, KABCO and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import msgprint, _, scrub
from datetime import date, timedelta, datetime

class EndofServiceSettlement(Document):

	def validate(self):
			la = frappe.get_all("Leave Allocation", fields=["*"],filters={"employee":self.employee}, order_by="creation desc", limit_page_length=1)

			if(len(la) > 0):
				print ("Leave Allocation ={} ".format(la[0]))



	def on_submit(self):
		self.validate_change_status()
		self.create_new_additional_salary()
		self.submit_additional_salary()
		self.update_emp_leave_date()
		self.update_emp_status_vacation()


	def validate_change_status(self):
		if self.change_status == "Changed":
			msgprint(_("The data has been changed, Please Click [Calculate Settlement] again"),
					raise_exception=1)

	def create_new_additional_salary(self):
		doc = frappe.get_doc({
			"doctype": "Additional Salary",
			"employee": self.employee,
			"employee_name": self.employee_name,
			"department": self.department,
			"company": self.company,
			"payroll_date": self.start_date,
			"salary_component": "تصفية إجازة",
			"overwrite_salary_structure_amount": 1,
			"vacation_settlement":self.name,
			"remarks": ("مقابل راتب " + " من تاريخ " + self.end_date + " حتى " + self.posting_date),
			"amount": self.pending_salary
		})
		doc.insert()
		return doc

		
	def submit_additional_salary(self):
		additional_salary = frappe.get_list("Additional Salary",filters={"vacation_settlement":self.name})[0]
		additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
		additional_salary.submit()

	def update_emp_leave_date(self):
		leave_date = frappe.get_list("Employee",filters={"employee":self.employee})[0]
		leave_date = frappe.get_doc("Employee", leave_date.name)
		leave_date.last_leave_date = self.last_day_working
		leave_date.relieving_date = self.last_day_working
		leave_date.save()

	def update_emp_status_active(self):
		emp_status = frappe.get_list("Employee",filters={"employee":self.employee})[0]
		emp_status = frappe.get_doc("Employee", emp_status.name)
		emp_status.status = "Active"
		emp_status.last_leave_date = ''
		emp_status.relieving_date = ''
		emp_status.save()

	def update_emp_status_vacation(self):
		emp_status = frappe.get_list("Employee",filters={"employee":self.employee})[0]
		emp_status = frappe.get_doc("Employee", emp_status.name)
		emp_status.status = "Vacation"
		emp_status.save()

	def on_cancel(self):
		additional_salary = frappe.get_list("Additional Salary",filters={"vacation_settlement":self.name})[0]
		additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
		additional_salary.cancel()

		self.update_emp_status_active()

	def on_trash(self):
		if self.docstatus != 0:
			additional_salary = frappe.get_list("Additional Salary",filters={"vacation_settlement":self.name})[0]
			additional_salary = frappe.get_doc("Additional Salary", additional_salary.name)
			additional_salary.delete()