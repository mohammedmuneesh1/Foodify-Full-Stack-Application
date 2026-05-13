

Because you're sending:

multipart/form-data

BUT your route does NOT have multer middleware.


so multer convert to req,.body after passing through its middleware?


Yes. Exactly.

multer parses:

multipart/form-data

and converts it into:

req.body
req.file
req.files