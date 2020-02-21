// Copyright (c) 2019, KABCO and contributors
// For license information, please see license.txt

frappe.ui.form.on('Attendance Violation', {
	setup: function (frm) {

		frm.getstartnednofmonth = function () {
			var me = this;
			if (frm.doc.posting_date) {
				frappe.call({
					method: 'erpnext.hr.doctype.payroll_entry.payroll_entry.get_start_end_dates',
					args: {
						payroll_frequency: "Monthly",
						start_date: frm.doc.posting_date
					},
					callback: function (r) {
						if (r.message) {
							frm.set_value('start_date', r.message.start_date);
							frm.set_value('end_date', r.message.end_date);
							refresh_field("start_date");
							refresh_field("end_date");
						}
					}
				});

			}
		}

		frm.getstartnednofmonth();
		
	},


	posting_date: function (frm) {
		frm.getstartnednofmonth();
	},

	employee: function (frm) {
		cur_frm.clear_table("earnings");

		frappe.call({
			"method": "kader.kader.tools.get_full_salary",
			async: false,
			args: {
				employee: frm.doc.employee,
				start_date: frm.doc.start_date,
				end_date: frm.doc.end_date
			},
			callback: function (data) {
				//earnings
				let earnings_amount = 0;
				$.each(data.message.earnings, function (index, value) {
					if (value.salary_component != "GOSI(C)" && value.salary_component != "سكن") {
						let new_row = frm.add_child("earnings");
						new_row.component = value.salary_component;
						new_row.amount = value.amount;
						earnings_amount = earnings_amount + value.amount;
						frm.set_value("salary_no_housing", earnings_amount);
					}
				});

				refresh_field("earnings");

			}
		});

	},


});
