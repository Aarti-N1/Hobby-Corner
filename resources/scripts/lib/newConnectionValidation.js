
$(document).ready(function(){
    $("#datetimepick" ).datetimepicker({
    	controlType: 'select',
		timeFormat: 'hh:mm tt',
        dateFormat: 'D dd MM yy',
        oneLine: true,
        onShow: function () {
            this.setOptions({
                maxDate:$('#tdate').val()?$('#tdate').val():false,
                maxTime:$('#tdate').val()?$('#tdate').val():false
            });
        }
  }).attr('readonly', 'readonly');
  $("#topic").select2({
    placeholder: "Select a Topic or Enter a new one.",
    tags: true
  });

}); 
