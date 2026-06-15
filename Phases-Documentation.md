# Phase 1 Testing



## Database Testing



#### Testing 1: Add an Employee

Expected Outcome: Employee details that are required or Non-nullable should be entered and saved successfully

Actual Outcome: Employee details that were required were added successfully



#### Testing 2: Add Availability

Expected Outcome: Using employee\_id, input necessary fields and it should be referenced and save correctly.

Actual Outcome: Using the employee\_id for Sarah from the employee table, it was referenced correctly and saved successfully.



#### Testing 3: Add Shift

Expected Outcome: Using employee\_id for both columns: employee\_id and created\_by, create a new row for the employee, Sarah successfully

Actual Outcome: The row has been successfully created. Note: For the row to be successfully created also add the employee\_id into the created\_by column.



#### Testing 4: Try entering an invalid employee

Expected Outcome: The database should throw an error at the invalid employee\_id input

Actual Outcome: the database threw an error at the invalid employee\_id inputted





# Phase 2 - Authentication

Staff login: Email + Password with invite-only accounts (manager adds staff → staff gets invite email).

Testing 5: Is the Page working?

Expected Outcome: Go to http://localhost:3000/login and the input boxes should be shown, consisting of an email text box, password, and a login button

Actual Outcome: The login page is working as expected


By 14/06/2026 I finished building
✅ database schema
✅ relationships
✅ Supabase Auth login
✅ session handling
✅ employee ↔ auth linking
✅ role-based routing with accompanied tests
✅ manager redirect with accompanied tests
✅ protected loading state with accompanied tests



Testing 6: Is the Route Guard working?

Expected Outcome 1: Go to http://localhost:3000/dashboard and it should redirect to the login page if not logged in
Expected Outcome 2: If an employee not logged in tries to access http://localhost:3000/admin it should block access and redirect to the login page
Expected Outcome 3: Go to http://localhost:3000/admin and it should show the admin page if logged in as a manager

Actual Outcome 1: The route guard is working as expected, redirecting to the login page if not logged in
Actual Outcome 2: The route guard is working as expected, redirecting to the login page
Actual Outcome 3: The route guard is working as expected, showing the admin page if logged in as a manager

Testing 7: Is the Logout working?

Expected Outcome: When the logout button is clicked, it should log the user out and redirect to the login page (Both for manager and employee)

Actual Outcome: The logout button is working as expected, logging the user out and redirecting to the login page for both manager and employee

Testing 8: Is the Employee page in the manager dashboard working?

Expected Outcome: When the manager clicks on the Employee page, it should show a list of employees and a button to add a new employee.

Actual Outcome: The Employee page is working as expected, showing a list of employees and a button to add a new employee.


Testing 9: Is the Add Employee page in the manager dashboard working?
Expected Outcome: When the manager clicks on the Add Employee button, it should show a form to add a new employee with all the required fields. When the form is submitted, it should add the new employee to the database and redirect back to the Employee page.

Actual Outcome: The app returned: failed to add employee. The error message was that the 'Add Employee' was violating one of the RLS policies. After checking the RLS policies, it was found that the policy did not allow for any insert into the employees table. A new policy was added to strictly allow the manager through authentication to insert a new employee and the test was successful.

By 16/06/2026 I finished building
✅ Auth system
✅ Role-based routing
✅ Protected pages
✅ Sessions
✅ Admin sidebar
✅ Employee list
✅ Add employee form
✅ Database insert
✅ RLS working



