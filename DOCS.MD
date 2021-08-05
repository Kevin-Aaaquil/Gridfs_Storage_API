# Storage App (backend)
## Password Validation

It must have Atleast 8 characters, 1 Uppercase, 1 Lowercase, 1 Digit and 1 Special Character/Symbol


## Private
Any route defined private can only be accessed after login

## Public
Any route defined public can be accessed without login

# Routes : 

# SIGN-IN
## POST root/login       
```
~urlencoded~
{
    email:"",
    password:""
}
```
### on success
```
{
    "status": "ok",
    "message": "login successfull"
}
```
### else
```
status code = 401 Unauthorized
Unauthorized
```
### if accessed after login
```
{
    "status": "error",
    "message": "user is already logged in"
}
```

## POST root/logout?_method=DELETE
```
no body
```
### on success
```
{
    "status": "ok",
    "message": "user logged out"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/register
```
~urlencoded~
{
    name:"",
    email:"",
    password:"",
    cpassword:""
} // all mandatory
```
### on success
```
{
    "status": "ok",
    "message": "user registration successfull"
}
```
### errs
```
// if email exists
{
    "code": 404,
    "success": false,
    "message": "email already exists"
}

// if passwords don't match
{
    "code": 404,
    "success": false,
    "message": "password don't match"
}

// if password is not valid schema
{
    "code": 404,
    "success": false,
    "message": "not a valid password"
}

// if data incomplete
{
    "code": 404,
    "success": false,
    "message": "data incomplete"
}
```
### if accessed after login
```
{
    "status": "error",
    "message": "user is already logged in"
}
```

## POST root/edit?_method=PUT
```
~urlencoded~
{
    old_password:"",
    new_password:"",
    cnew_password:"",
} // mandatory
```
### on success
```
{
    "status": "ok",
    "message": "password changed and user logged out"
}
```
### errs
```
// incorrect password
{
    "code": 404,
    "success": false,
    "message": "Incorrect Password"
}

// non matching password
{
    "code": 404,
    "success": false,
    "message": "password don't match"
}

// if password is not a valid schema
{
    "code": 404,
    "success": false,
    "message": "not a valid password"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/delete?_method=DELETE
```
~urlencoded~
{
    password:""
}
```
### on success
```
{
    "status": "ok",
    "message": "account deleted and user logged out"
}
```
### wrong password
```{
    "code": 404,
    "success": false,
    "message": "Wrong Password"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```
# PROFILE

## POST root/profile/view
```
no body
```
### on success
```
{
    "status": "ok",
    "data": {
        <data will be here>
    }
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/profile/update?_method=PUT
```
~urlencoded~
{
    "name":"",              // required
    "email":"",             // required
    <any more data>
}
```
### on success
```
{
    "code": 200,
    "success": true,
    "message": "Profile updated"
}
```
### if name or email is missing
```
{
    "code": 404,
    "success": false,
    "message": "name and email are mandatory"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```
# FILES

## POST root/files/upload
```
~form-data~
{
    file: <single file only>   // set enctype to multiparted
}
```
### on success
```
{
    "status": "ok",
    "message": "file uploaded"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/files/viewall
```
no body
```
### on success
```
[
    {
    
        "length": 6738,
        "uploadDate": "2021-07-08T18:42:29.808Z",
        "filename": "3xc4POCz4m--accounts.jpg",
        "contentType": "image/jpeg"
    
    }
] 
// this will display an array of objects of all files 
// NOTE: remove text `10 digit code` & `--` from file name, that is just to make this file unique.
```
#### if no files
```
{
    "code": 404,
    "success": false,
    "message": "No files for this user"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/files/view/file
```
~urlencoded~
{
    filename:""  
}
//NOTE : original filename is to be submitted, the one of the following format `10_digit_code--original_filename`
```
### on success
```
file is initialized in browser
```
### if file is not initialized
```
{
    "code": 404,
    "success": false,
    "message": "cannot initialize file"
}
```
### if file unavailable
```
{
    "code": 404,
    "success": false,
    "message": "No such file for this user"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/view/filejson
```
~urlencoded~
{
    filename:""  
}
//NOTE : original filename is to be submitted, the one of the following format `10_digit_code--original_filename`
```
### on success
```
{
    "length": 592677,
    "uploadDate": "2021-07-08T19:22:30.435Z",
    "filename": "3xc4POCz4m--517753 (1).jpg",
    "contentType": "image/jpeg"
}
```
### if file unavailable
```
{
    "code": 404,
    "success": false,
    "message": "No such file for this user"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```

## POST root/files/delete/file?_method=DELETE
```
~urlencoded~
{
    filename:""
}
//NOTE : original filename is to be submitted, the one of the following format `10_digit_code--original_filename`
```
### on success
```
{
    "success": true,
    "message": "file deleted"
}
```
### if file unavailable
```
{
    "code": 404,
    "success": false,
    "message": "No such file for this user"
}
```
### if accessed before login
```
{
    "status": "error",
    "message": "not logged in"
}
```
