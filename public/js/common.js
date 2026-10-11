// Global safety net: any AJAX call that gets a 403 (permission denied by
// the server's role middleware) shows a clear message instead of failing
// silently. UI should already hide actions a role can't perform, but this
// catches anything missed or any stale page where a role changed.
$(document).ajaxError(function (event, jqxhr) {
  if (jqxhr.status !== 403) return;

  var message = "You don't have permission to do that. Ask an admin to grant you access.";
  try {
    var body = JSON.parse(jqxhr.responseText);
    if (body && body.error) {
      message = body.error;
    }
  } catch (e) {}

  if (typeof swal === "function") {
    swal({ icon: "error", title: "Access denied", text: message });
  } else {
    alert(message);
  }
});
