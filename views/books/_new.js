<h2>New Book</h2>
<form action="/books" method="POST" enctype="multipart/form-data">
  <%- include('_form_fields') %>
  <a href="/books">Cancel</a>
  <button type="submit">Create</button>
</form>
