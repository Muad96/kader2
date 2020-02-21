// Copyright (c) 2019, KABCO and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vacation Settlement', {
	onload: function (frm) {
		cur_frm.set_query("employee", function () {
			return {
				"filters": {
					"status": "Active",
				}
			};
		});

	},

	setup: function (frm) {

		frm.get_basic_hosing = function (earnings) {
			let bh = 0;
			$.each(earnings, function (index, value) {
				if (value.component == "سكن" || value.component == "أساسي") {
					bh = bh + value.amount;
				}
			});
			return bh;
		}
	},

	refresh: function (frm) {

		frm.trigger("settlement_breakdown");

		frm.add_custom_button(__("Calculate Settlement"), function () {

			cur_frm.clear_table("settlement_breakdown");
			cur_frm.refresh_fields("settlement_breakdown");

			cur_frm.clear_table("earnings");
			cur_frm.clear_table("deductions");
			cur_frm.refresh_fields("earnings");
			cur_frm.refresh_fields("deductions");


			if (!frm.doc.posting_date) {
				frappe.throw(__("Please make sure that there is a vallid Leave Application for the emplyee (" + frm.doc.employee_name) + ")");
			} else if (frm.doc.last_day_working < frm.doc.date_joining_work) {
				frappe.throw(__("Can not create Vacation Settlement where (Date Joining Work) is greater than (Last Day Working)"));
			} else {

				frm.final_total = 0;
				frm.doc.earnings = [];
				frm.doc.deductions = [];
				frm.total_dedction = 0;


				//get last sattlement
				frappe.call({
					method: 'kader.kader.tools.get_last_settlement',
					async: false,
					args: {
						employee: frm.doc.employee,
						doctype: "Vacation Settlement"
					},
					callback: function (r) {
						if (r.message) {
							let diff = frappe.datetime.get_day_diff(frm.doc.start_date, r.message.posting_date);
							3
							//console.log("diff", diff);
							if (diff < 330) {
								frappe.throw(__("Vacation Settlement is not applicable"));
							}
						}
					}
				});


				//get salary
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
							//if (value.salary_component == "سكن" || value.salary_component == "أساسي") {
							if (value.salary_component != "GOSI(C)") {
								let new_row = frm.add_child("earnings");
								new_row.component = value.salary_component;
								new_row.amount = value.amount;
								earnings_amount = earnings_amount + value.amount;
								frm.set_value("total_earnings", earnings_amount);
							}
						});


						//deductions
						let deductions_amount = 0;
						$.each(data.message.deductions, function (index, value) {
							let new_row = frm.add_child("deductions");
							new_row.component = value.salary_component;
							new_row.amount = value.amount;
							frm.total_dedction = frm.total_dedction + value.amount;
							deductions_amount = deductions_amount + value.amount;
							frm.set_value("total_deductions", deductions_amount);
						});
						//console.log("frm.total_dedction =", frm.total_dedction);

						refresh_field("earnings");
						refresh_field("deductions");
					}
				});

				//get Violation Deduction
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
							//console.log("data.message", data.message);
							//console.log("value = ", value);
							let new_row = frm.add_child("deductions");
							new_row.component = "Violation Deduction";
							new_row.amount = value.amount;
							frm.total_dedction = frm.total_dedction + value.amount;
						});

						frm.refresh_field("deductions");
						//console.log("frm.total_dedction + violation =", frm.total_dedction);
					}
				});


				//### BENEFITS TABLE ####

				//Get Vacation Settlement;
				//console.log("frm.doc.last_day_working = " + frm.doc.last_day_working + " frm.doc.date_joining_work = ", frm.doc.date_joining_work);
				let diff = frappe.datetime.get_day_diff(frm.doc.last_day_working, frm.doc.date_joining_work);
				//console.log("diff = " + diff);
				let bh = frm.get_basic_hosing(frm.doc.earnings);
				let deserve_yearly = bh / 30 * frm.doc.annual_vacation;
				let deserve_daily = deserve_yearly / 365;
				frm.final_total = parseInt(deserve_daily * diff);

				//add +row in [settlement_breakdown] Table
				let new_row_ft = frm.add_child("settlement_breakdown");
				new_row_ft.description = ("مقابل تصفية إجازة حتى " + frm.doc.posting_date);
				new_row_ft.amount = parseInt(deserve_daily * diff);
				refresh_field("settlement_breakdown");


				//get salary working days of current month
				frappe.call({
					"method": "kader.kader.tools.get_salary",
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
							if (value.salary_component != "GOSI(C)") {
								let new_row = [];
								new_row.component = value.salary_component;
								new_row.amount = value.amount;
								earnings_amount = earnings_amount + value.amount;
							}
						});


						//deductions
						let deductions_amount = 0;
						$.each(data.message.deductions, function (index, value) {
							let new_row = [];
							new_row.component = value.salary_component;
							new_row.amount = value.amount;
							frm.total_dedction = frm.total_dedction + value.amount;
							deductions_amount = deductions_amount + value.amount;
						});

						let current_month_days = frappe.datetime.get_day_diff(frm.doc.end_date, frm.doc.start_date) + 1;
						let working_month_days = frappe.datetime.get_day_diff(frm.doc.posting_date, frm.doc.start_date);
						let diff_month_days = current_month_days - working_month_days;

						//add +row in [settlement_breakdown] Table
						if (working_month_days > 0) {
							let new_row_lastmntsal = frm.add_child("settlement_breakdown");
							new_row_lastmntsal.description = ("مقابل راتب " + working_month_days + " يوم من تاريخ " + frm.doc.start_date + " حتى " + frm.doc.last_day_working);
							new_row_lastmntsal.amount = (((earnings_amount / current_month_days) * working_month_days) - deductions_amount).toFixed(2);
							refresh_field("settlement_breakdown");

							frm.set_value("pending_salary", new_row_lastmntsal.amount);
						} else {
							frm.set_value("pending_salary", 0);
						}

					}
				});


				/* //get salary for un-paid months
				let pending_months_count = 0;
				let pending_months = frm.doc.salary_slip_from_date;
				let pending_months_start_date = 0;
				let pending_months_end_date = 0;

				while (pending_months < frm.doc.start_date) {
					pending_months = frappe.datetime.add_months(pending_months, 1);
					console.log("pending_months = ", pending_months);
					pending_months_count++;
					console.log("pending_months = ", pending_months_count);
				}

				for (var i = 1; i < pending_months_count; i++) {
					let pending_months_hold = frappe.datetime.add_months(frm.doc.salary_slip_from_date, i);

					frappe.call({
						method: 'erpnext.hr.doctype.payroll_entry.payroll_entry.get_start_end_dates',
						args: {
							payroll_frequency: "Monthly",
							start_date: pending_months_hold
						},
						callback: function (r) {
							if (r.message) {
								pending_months_start_date = r.message.start_date;
								pending_months_end_date = r.message.end_date;
							}
						}
					});

					frappe.call({
						"method": "kader.kader.tools.get_salary",
						async: false,
						args: {
							employee: frm.doc.employee,
							start_date: pending_months_start_date,
							end_date: pending_months_end_date
						},
						callback: function (data) {
							//earnings
							let earnings_amount = 0;
							$.each(data.message.earnings, function (index, value) {
								if (value.salary_component != "GOSI(C)") {
									let new_row = frm.add_child("earnings");
									new_row.component = value.salary_component;
									new_row.amount = value.amount;
									earnings_amount = earnings_amount + value.amount;
								}
							});


							//deductions
							let deductions_amount = 0;
							$.each(data.message.deductions, function (index, value) {
								let new_row = frm.add_child("deductions");
								new_row.component = value.salary_component;
								new_row.amount = value.amount;
								frm.total_dedction = frm.total_dedction + value.amount;
								deductions_amount = deductions_amount + value.amount;
							});

							let pending_salary_net = (earnings_amount - deductions_amount);

							//console.log("Salary Slip ? = ", frappe.datetime.add_months(frm.doc.salary_slip_from_date, i));
							let pending_months_salaries = frm.add_child("settlement_breakdown");
							pending_months_salaries.description = ("مقابل راتب الفترة " + pending_months_hold);
							pending_months_salaries.amount = pending_salary_net;
							refresh_field("settlement_breakdown");

						}
					});
				} */


				//add +row in [settlement_breakdown] Table
				if (frm.doc.ticket != 0) {
					let new_row_ticket = frm.add_child("settlement_breakdown");
					new_row_ticket.description = ("مقابل تذكرة لبلد الموظف");
					new_row_ticket.amount = frm.doc.ticket;
					refresh_field("settlement_breakdown");
				}

				//### BENEFITS TABLE  [END] ####


				//Final Benefits Calculation
				frm.trigger("settlement_breakdown");
			}


			//Update Change Status
			frm.set_value("change_status", 'No Change');
			frm.refresh_field("change_status");

		});

	},


	settlement_breakdown: function (frm) {
		if (frm.doc.settlement_breakdown) {
			let total_benefits = 0;
			$.each(frm.doc.settlement_breakdown || [], function (i, row) {
					total_benefits += flt(row.amount);
			});
			frm.set_value("total_benefits", total_benefits);;
			refresh_field("total_benefits");
		}
	},


	posting_date: function (frm) {
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
					}
				}
			});
		}
	},
	employee_name: function (frm) {

		// Clear All Fields
		frm.set_value('last_salary_slip', '')
		frm.set_value('salary_slip_from_date', '')
		frm.set_value('last_joining_work', '')
		frm.set_value('salary_slip_to_date', '')
		frm.set_value('leave_application', '')
		frm.set_value('leave_without_pay_days', '')
		frm.set_value('last_day_working', '')
		frm.set_value('posting_date', '')
		frm.set_value('to_date', '')
		frm.set_value('salary_slip_net', '')
		frm.set_value('pending_salary', '')

		if (frm.doc.employee) {

			//Add Ticket Price in [settlement_breakdown]
			frappe.db.get_value('Nationality', frm.doc.nationality, 'ticket_price')
				.then(r => {
					frm.set_value("ticket", r.message.ticket_price);
					frm.refresh_field("ticket");


				});

			//get Leave Application
			frappe.call({
				method: "frappe.client.get_list",
				async: false,
				args: {
					doctype: "Leave Application",
					fields: ["name", "from_date", "to_date"],
					filters: {
						"employee": frm.doc.employee,
						//"leave_type": "إجازة سنوية",
						"Status": "Approved",
						"docstatus": "1"
					},
					order_by: "posting_date desc",
					limit_page_length: 1
				},
				callback: function (r) {
					//console.log("r", r);
					if (r.message) {
						frm.set_value("leave_application", r.message[0].name);
						//frm.set_value("last_day_working", r.message[0].from_date);
						frm.set_value("posting_date", r.message[0].from_date);
						frm.set_value("to_date", r.message[0].to_date);

						frm.refresh_field("leave_application");
						//frm.refresh_field("last_day_working");
						frm.refresh_field("posting_date");
						frm.refresh_field("to_date");

					}
				}

			});


			// Get Last Working Day
			frm.set_value("last_day_working", frappe.datetime.add_days(frm.doc.posting_date, -1));
			frm.refresh_field("last_day_working");


			//get Leave Without Pay Days
			frappe.call({
				method: 'kader.kader.tools.get_leave_without_pay',
				async: false,
				args: {
					"employee": frm.doc.employee
				},
				callback: function (r) {
					if (r.message) {
						frm.set_value('leave_without_pay_days', r.message);
						frm.refresh_field("leave_without_pay_days");
					}
				}
			});

			//get last Joining Work
			frappe.call({
				method: "frappe.client.get_list",
				async: false,
				args: {
					doctype: "Joining Work",
					fields: ["name", "date_of_work_start"],
					filters: {
						"employee": frm.doc.employee,
						"docstatus": "1"
					},
					limit_page_length: 1
				},
				callback: function (r) {
					//console.log("Joining Work = ", r);
					if (r.message) {
						frm.set_value("last_joining_work", r.message[0].name);
						//frm.set_value("date_joining_work", r.message[0].date_of_work_start);
						frm.refresh_field("last_joining_work");
						//frm.refresh_field("date_joining_work");
					}
				}
			});

			//get last last_salaryslip
			frappe.call({
				method: "frappe.client.get_list",
				async: false,
				args: {
					doctype: "Salary Slip",
					fields: ["name", "start_date", "end_date", "net_pay"],
					filters: {
						"employee": frm.doc.employee,
						"docstatus": "1"
					},
					order_by: "posting_date desc",
					limit_page_length: 1
				},
				callback: function (r) {
					//console.log("Salary Slip = ", r);
					if (r.message) {
						frm.set_value("last_salary_slip", r.message[0].name);
						frm.set_value("salary_slip_from_date", r.message[0].start_date);
						frm.set_value("salary_slip_to_date", r.message[0].end_date);
						frm.set_value("salary_slip_net", r.message[0].net_pay);

						frm.refresh_field("last_salary_slip");
						frm.refresh_field("salary_slip_to_date");
						frm.refresh_field("salary_slip_from_date");
						frm.refresh_field("salary_slip_net");

					}
				}
			});


			//get difference since last joining
			var fromdate = new Date(frm.doc.posting_date);
			var todate = new Date(frm.doc.date_joining_work);
			var diff_date = fromdate - todate;
			var Ydays = Math.floor(diff_date / 31536000000);
			var Mdays = Math.floor((diff_date % 31536000000) / 2628000000);
			var Ddays = Math.floor(((diff_date % 31536000000) % 2628000000) / 86400000) + 1;
			frm.set_value("diff_total_days", frappe.datetime.get_day_diff(frm.doc.posting_date, frm.doc.date_joining_work));

			if ((Ydays < 0) || !frm.doc.posting_date) {
				frm.set_value("last_jw_years", 0);
			} else {
				frm.set_value("last_jw_years", Ydays);
			}

			if (Mdays < 0 || !frm.doc.posting_date) {
				frm.set_value("last_jw_months", 0);
			} else {
				frm.set_value("last_jw_months", Mdays);
			}

			if (Ddays < 0 || !frm.doc.posting_date) {
				frm.set_value("last_jw_days", 0);
			} else {
				frm.set_value("last_jw_days", Ddays);
			}

			frm.refresh_field("diff_total_days");
			frm.refresh_field("last_jw_years");
			frm.refresh_field("last_jw_months");
			frm.refresh_field("last_jw_days");

		}

		if (!frm.doc.last_day_working) {
			frappe.throw(__("The Employee have no valid Leave Application. Please create leave application before proceeding"));
		}

		//Update Change Status
		frm.set_value("change_status", 'Changed');
		frm.refresh_field("change_status");

	},

	ticket: function (frm) {
		if (frm.doc.ticket < 0 || !frm.doc.ticket) {
			frm.set_value('ticket', 0);
			refresh_field("ticket");
		}

		//Update Change Status
		frm.set_value("change_status", 'Changed');
		frm.refresh_field("change_status");
	}

});