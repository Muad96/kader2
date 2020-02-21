// Copyright (c) 2016, KABCO and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Employee Salary"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1
		},
		{
			"fieldname":"employee",
			"label": __("Employee"),
			"fieldtype": "Link",
			"options": "Employee",
			"get_query": function() {
				var company = frappe.query_report.get_filter_value('company');
				return {
					"doctype": "Employee",
					"filters": {
						"company": company,
					}
				}
			}
		},
		{
			"fieldname":"branch",
			"label": __("Branch"),
			"fieldtype": "Link",
			"options": "Branch",
			"get_query": function() {
				var company = frappe.query_report.get_filter_value('company');
				return {
					"doctype": "Branch",
					"filters": {
						"company": company,
					}
				}
			}
		},
		{
			"fieldname":"sponsor",
			"label": __("Sponsor"),
			"fieldtype": "Link",
			"options": "Owner",
		},
		{
			"fieldname":"Department",
			"label": __("department"),
			"fieldtype": "Link",
			"options": "Department",
		},
		{
			"fieldname":"residential_statusstatus",
			"label":__("Residential Status"),
			"fieldtype":"Select",
			"options":["", "Citizen", "Resident", "Citizen Child", "Spouse of Citizen"],
		}
	]
}