frappe.ui.form.on('Employee', {
	onload: function (frm) {
		if (frm.doc.date_of_birth) {
			console.log("frm.doc.date_of_birth", frm.doc.date_of_birth);
			let days = frappe.datetime.get_day_diff(frappe.datetime.nowdate(), frm.doc.date_of_birth);
			frm.set_value("age", Math.floor((days).toFixed(2) / 365.25));
			frm.refresh_field("age");
		}
		if (frm.doc.company_joining_date) {
			console.log("frm.doc.company_joining_date", frm.doc.company_joining_date);
			let days = frappe.datetime.get_day_diff(frappe.datetime.nowdate(), frm.doc.company_joining_date);
			frm.set_value("years_experience", Math.floor((days).toFixed(2) / 365.25));
			frm.refresh_field("years_experience");

		}
		if (frm.is_dirty()) {
			frm.save();
		}
	},

	company_joining_date: function (frm) {
		let days = frappe.datetime.get_day_diff(frappe.datetime.nowdate(), frm.doc.company_joining_date);
		frm.set_value("years_experience", Math.floor((days).toFixed(2) / 365.25));
		frm.refresh_field("years_experience");
	},
	date_of_birth: function (frm) {
		let days = frappe.datetime.get_day_diff(frappe.datetime.nowdate(), frm.doc.date_of_birth);
		frm.set_value("age", Math.floor((days).toFixed(2) / 365.25));
		frm.refresh_field("age");

	},

	refresh: function (frm) {

		frm.add_custom_button(__("Update Salary"), function () {
			frm.final_total = 0;
			frm.doc.earnings = [];
			frm.doc.deductions = [];
			frm.total_dedction = 0;
			frm.total_earning = 0;


			/*get last sattlement
			frappe.call({
				method: 'kader.kader.tools.get_last_settlement',
				async: false,
				args: {
					employee: frm.doc.employee,
					doctype: "Vacation Settlement"
				},
				callback: function (r) {
					if (r.message) {
						let diff = frappe.datetime.get_day_diff(frm.doc.posting_date, r.message.posting_date);
						3
						console.log("diff", diff);
						if (diff < 330) {
							frappe.throw(__("Vacation Settlement is not applicable"));
						}
					}
				}
			});*/

			//get salary
			frappe.call({
				"method": "kader.kader.tools.get_full_salary",
				async: false,
				args: {
					employee: frm.doc.employee,
					start_date: frappe.datetime.add_days(frappe.datetime.nowdate(), 0),
					end_date: frappe.datetime.add_days(frappe.datetime.nowdate(), 0)
				},
				callback: function (data) {
					//earnings
					$.each(data.message.earnings, function (index, value) {
						if (value.salary_component != "GOSI(C)") {
							let new_row = frm.add_child("earnings");
							new_row.component = value.salary_component;
							new_row.amount = value.amount;
							frm.total_earning = frm.total_earning + value.amount;
						}
					});

					//deductions
					$.each(data.message.deductions, function (index, value) {
						if (value.salary_component != "GOSI(C)") {
							let new_row = frm.add_child("deductions");
							new_row.component = value.salary_component;
							new_row.amount = value.amount;
							frm.total_dedction = frm.total_dedction + value.amount;
						}
					});
					console.log("frm.total_dedction =", frm.total_dedction);
					console.log("frm.total_earning =", frm.total_earning);

					refresh_field("earnings");
					refresh_field("deductions");
				}
			});

			/*get Violation Deduction
			frappe.call({
				"method": "kader.kader.tools.get_employee_deduction",
				async: false,
				args: {
					employee: frm.doc.employee,
					start_date: frm.doc.start_date,
					end_date: frm.doc.end_date
				},
				callback: function (data) {
					$.each(data.message, function (index, value) {
						console.log("data.message", data.message);
						console.log("value = ", value);
						let new_row = frm.add_child("deductions");
						new_row.component = "Violation Deduction";
						new_row.amount = value.amount;
						frm.total_dedction = frm.total_dedction + value.amount;
					});

					frm.refresh_field("deductions");
					console.log("frm.total_dedction + violation =", frm.total_dedction);
				}
			});*/
		});
	}

});