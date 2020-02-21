// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// frappe.provide('erpnext');

// add toolbar icon
$(document).bind('toolbar_setup', function() {

	//$('.navbar-home').html('<img class="erpnext-icon" src="'+
		//	frappe.urllib.get_base_url()+'/assets/charity/images/sihat_logo.jpg" />');
});


function getHijriDate(date) {
	return HijriJS.toHijri(convertDate(date), "-").toString();
}

function getHijriYear(date) {
	var year = HijriJS.toHijri(convertDate(date), "-");
	return year.toFormat("yyyy").substring(2);
}

function convertDate(date) {
  date = new Date(date);
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return (ddChars[1]?dd:"0"+ddChars[0]) + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + yyyy;
}


function getAge(age){
        var yearThen = parseInt(age.substring(0,4), 10);
        var monthThen = parseInt(age.substring(5,7), 10);
        var dayThen = parseInt(age.substring(8,10), 10);

        var today = new Date();
        var birthday = new Date(yearThen, monthThen-1, dayThen);

        var differenceInMilisecond = today.valueOf() - birthday.valueOf();

        var year_age = Math.floor(differenceInMilisecond / 31536000000);
        var day_age = Math.floor((differenceInMilisecond % 31536000000) / 86400000);

        var month_age = Math.floor(day_age/30);

        day_age = day_age % 30;
        //console.log(isNaN(year_age) + " - " + isNaN(month_age) + " - " + isNaN(day_age));
        if (isNaN(year_age) || isNaN(month_age) || isNaN(day_age)) {
            console.log("Invalid birthday - Please try again!");
        }
        else {
            console.log("You are " + year_age + " years " + month_age + " months " + day_age + " days old");
						return year_age;
				}
    };
