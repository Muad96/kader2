	$(document).on('app_ready', function() {
	// switch language button
	$('<li><a href="#" onclick="accurate.ui.change_language_prompt();return false;"> '+__("Change Language")+'</a></li>').insertAfter($('.navbar-set-desktop-icons').next());

frappe.provide("accurate.ui");
accurate.ui.change_language_prompt = function() {
	frappe.prompt({fieldtype:"Link", options: "Language", fieldname: "language", label: __("Language"), default: frappe.boot.lang, reqd: 1},
				function(data) {
					frappe.msgprint(__("Updating Language.."));
					frappe.db.set_value("User", frappe.boot.user.name, "language", data.language, function(r) {
						 console.log('befor reload lang');
						window.location.reload();
					});
				}, "Change Language", "Update")
}

});
