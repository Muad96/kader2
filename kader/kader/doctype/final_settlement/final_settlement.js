// Copyright (c) 2019, KABCO and contributors
// For license information, please see license.txt

frappe.ui.form.on('Final Settlement', {
	setup: function(frm) {
			frm.daily_earnings = 0;
			frm.daily_earnings_till_date = 0;
			frm.gross_pay = 0;
			frm.total_dedction = 0;
			frm.diff = 0;
			frm.basic_benefit = 0;
	},
	posting_date: function(frm) {
			if (frm.doc.posting_date) {
					frappe.call({
							method: 'erpnext.hr.doctype.payroll_entry.payroll_entry.get_start_end_dates',
							args: {
									payroll_frequency: "Monthly",
									start_date: frm.doc.posting_date
							},
							callback: function(r) {
									if (r.message) {
											frm.set_value('start_date', r.message.start_date);
											frm.set_value('end_date', r.message.end_date);
									}
							}
					});
			}
	},
	refresh: function(frm) {
			// if (frm.doc.status ) {
			frm.add_custom_button(__("Calculate Settlement"), function() {
					var msg = "";
					var benefits = "";
					frm.daily_earnings = 0;

					frm.diff = 0;
					frm.basic_benefit = 0;

					if (frm.doc.status == "Resignation") {
							if (frm.doc.job_years < 2) {
									benefits = 0;
									msg = "no Benefits";
							} else if (frm.doc.job_years >= 2 && frm.doc.job_years < 5) {

									console.log("gross_pay = ", frm.gross_pay);
									var half_gross_pay = frm.gross_pay / 2;
									var daily_gross_pay = half_gross_pay / 365;
									benefits = daily_gross_pay * frm.doc.job_days;
									benefits = benefits/ 3 ;
									msg = "Benefits 1/3 = " + benefits;
							} else if (frm.doc.job_years >= 5 && frm.doc.job_years < 10) {
								let first = (frm.gross_pay / 2) * 5;
								let second = (frm.gross_pay / 365) * ( parseInt(frm.doc.job_days) - 1825) ;
								let total = parseInt(first) + parseInt(second);
								benefits = (total / 3 ) * 2;
									msg = "Benefits 2/3 = " + benefits;
							} else if (frm.doc.job_years >= 10) {
								let first = (frm.gross_pay / 2) * 5;
								let second = (frm.gross_pay / 365) * ( parseInt(frm.doc.job_days) - 1825) ;
								let total = parseInt(first) + parseInt(second);
								benefits = total;
								msg = "Benefits full = " + benefits;
							}
					} else {
							if (frm.doc.job_years >= 1 && frm.doc.job_years <= 5) {
								var half_gross_pay = frm.gross_pay / 2;
								var daily_gross_pay = half_gross_pay / 365;
								benefits = daily_gross_pay * frm.doc.job_days;
								msg = "Benefits 1/2 = " + benefits;
							} else if (frm.doc.job_years >= 5) {
									let first = (frm.gross_pay / 2) * 5;
									let second = (frm.gross_pay / 365) * ( parseInt(frm.doc.job_days) - 1825) ;
									let total = parseInt(first) + parseInt(second);
									benefits = total;
									msg = "Benefits 1/2 for first 5 then full for the rest = " + benefits;
							}
					}
					// console.log("msg = " + msg + " benefits = " + benefits + " total_dedction = " +
					// 		frm.total_dedction + " frm.daily_earnings_till_date = " + frm.daily_earnings_till_date);
					frm.set_value("text_20", msg);
					console.log("benefits = "+ benefits + " frm.total_dedction = "+ frm.total_dedction + " frm.daily_earnings_till_date = "+ frm.daily_earnings_till_date);
					frm.set_value("total_benefits", parseInt(benefits) + parseInt(frm.daily_earnings_till_date) - parseInt(frm.total_dedction) );
					refresh_field("text_20");
					refresh_field("total_benefits");
			});
			// }
	},
	employee: function(frm) {

			if (frm.doc.employee) {
					frm.doc.earnings = [];
					frm.doc.deductions = [];

					//get last salaryslip
					frappe.call({
							method: "frappe.client.get_list",
							args: {
									doctype: "Salary Slip",
									fields: ["name", "posting_date"],
									filters: {
											"employee": frm.doc.employee,
											"docstatus": "1"
									},
									order_by: "posting_date",
									limit_page_length: 1
							},
							callback: function(r) {
									if (r.message) {
											console.log("last salaryslip  =", r.message);
											frm.set_value("last_salary_slip", r.message[0].name);
											frm.refresh_field("last_salary_slip");
											frm.refresh_field("salary_slip_posting_date");
											console.log("/////////////////////");
											console.log("frm.doc.salary_slip_posting_date = "+frm.doc.salary_slip_posting_date +" frm.doc.last_day_working = "+ frm.doc.last_day_working);
											frm.diff = frappe.datetime.get_day_diff(frm.doc.last_day_working,frm.doc.salary_slip_posting_date);
											console.log("frm.diff = " + frm.diff);
											console.log("/////////////////////////");
									}
							}
					});

					//get salary information
					frappe.call({
							"method": "kader.kader.tools.get_salary",
							args: {
									employee: frm.doc.employee,
									start_date: frm.doc.start_date,
									end_date: frm.doc.end_date
							},
							callback: function(data) {
									frm.gross_pay = data.message.gross_pay;
									console.log("gross_pay =", frm.gross_pay);
									//earnings
									$.each(data.message.earnings, function(index, value) {
											var new_row = frm.add_child("earnings");
											new_row.component = value.salary_component;
											new_row.amount = value.amount;
											// if (value.salary_component != "Housing") {
													frm.daily_earnings = frm.daily_earnings + value.amount;
											// }
									});
									console.log("frm.daily_earnings = ", frm.daily_earnings);

									//deductions
									$.each(data.message.deductions, function(index, value) {
											var new_row = frm.add_child("deductions");
											new_row.component = value.salary_component;
											new_row.amount = value.amount;
											frm.total_dedction = frm.total_dedction + value.amount;
									});
									refresh_field("earnings");
									refresh_field("deductions");
									console.log("///////////////////");
									console.log("frm.daily_earnings = "+frm.daily_earnings + " frm.diff = "+ frm.diff);
									frm.daily_earnings_till_date = parseInt(frm.daily_earnings) / 30 * parseInt(frm.diff);
									console.log("frm.daily_earnings_till_date = "+ frm.daily_earnings_till_date);
									console.log("////////////////////");
							}
					});

					//get Violation Deduction
					frappe.call({
							"method": "kader.kader.tools.get_employee_deduction",
							args: {
									employee: frm.doc.employee,
									start_date: frm.doc.start_date,
									end_date: frm.doc.end_date
							},
							callback: function(data) {
									$.each(data.message, function(index, value) {
											var new_row = frm.add_child("deductions");
											new_row.component = "Violation Deduction";
											new_row.amount = value.amount;
											frm.total_dedction = frm.total_dedction + value.amount;
									});

									frm.refresh_field("deductions");
									console.log("deductions = ", data);
							}
					});

					//get last Joining
					frappe.call({
							"method": "kader.kader.tools.get_last_joining",
							args: {
									employee: frm.doc.employee,
							},
							callback: function(data) {
									console.log("data.message.date_of_work_start = ", data);
									if (data.message.date_of_work_start) {
											frm.set_value("last_joining_work", data.message.date_of_work_start);
											refresh_field("last_joining_work");
											console.log("data.message  get_last_joining= ", data.message);
									} else {
											console.log("in else");
											frm.set_df_property("last_joining_work", "read_only", 0);
											refresh_field("last_joining_work");
									}
							}
					});
			}
	},
	last_day_working: function(frm) {
			let days = frappe.datetime.get_day_diff(frm.doc.last_day_working, frm.doc.join_date);
			frm.set_value("job_days", days);
			refresh_field("job_days");

			frm.set_value("job_years", Math.floor((days).toFixed(2) / 365.25));
			refresh_field("job_years");

			console.log("days", days);
			console.log("year", Math.floor((days).toFixed(2) / 365.25));

	}
});

