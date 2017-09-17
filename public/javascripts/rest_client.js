//$(document).ready(function() {
  //$(".resource").each(function(index, form) {
    //console.log(form);
    //wait(5000);
    //form.submit(function(event) {
      //var dat = JSON.stringify(form.serializeArray());

      //alert("I am about to POST this:\n\n" + dat);

      //$.post(
        //form.attr("action"),
        //dat,
        //function(data) {
          //alert("Response: " + data);
        //}
      //);
      //event.preventDefault();
    //});
  //});
//});

function updateRates(rate) {
  $('#trade_summary li').each(function(index, li) {
    var name = $(li).attr('id');
    var allocation = $(`#${name}`).attr('value');

    $(`li#${name}`).text(`${name}: $${rate * allocation / 100}`);
  });
};

$(document).ready(function() {
  $('#trade_amount').on('keypress', function(event) {
    updateRates($(this).val());
  });
});
