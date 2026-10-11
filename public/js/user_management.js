$(document).ready(function () {
  $("#addUserBtn").click(function () {
    const data = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      email: $("#email").val(),
      password: $("#password").val(),
      role: $("#role").val(),
    };
    $.ajax({
      url: "/users/create",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function () {
        location.reload();
      },
      error: function (xhr) {
        alert((xhr.responseJSON && xhr.responseJSON.error) || "Failed to add user");
      },
    });
  });

  $(".role-select").change(function () {
    const id = $(this).data("id");
    const role = $(this).val();
    $.ajax({
      url: "/users/manage/" + id + "/role",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ role: role }),
      success: function () {
        location.reload();
      },
      error: function (xhr) {
        alert((xhr.responseJSON && xhr.responseJSON.error) || "Failed to update role");
        location.reload();
      },
    });
  });

  $(".reset-password-btn").click(function () {
    const id = $(this).data("id");
    const name = $(this).data("name");
    const newPassword = prompt("Enter a new password for " + name + ":");
    if (!newPassword) return;
    $.ajax({
      url: "/users/manage/" + id + "/password",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ password: newPassword }),
      success: function () {
        alert("Password updated for " + name);
      },
      error: function (xhr) {
        alert((xhr.responseJSON && xhr.responseJSON.error) || "Failed to update password");
      },
    });
  });

  $(".delete-user-btn").click(function () {
    const id = $(this).data("id");
    const name = $(this).data("name");
    if (!confirm("Delete user " + name + "? This cannot be undone.")) return;
    $.ajax({
      url: "/users/manage/" + id,
      type: "DELETE",
      success: function () {
        location.reload();
      },
      error: function (xhr) {
        alert((xhr.responseJSON && xhr.responseJSON.error) || "Failed to delete user");
      },
    });
  });
});
