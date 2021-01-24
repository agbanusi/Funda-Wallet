# Documentation

- POST '/register'
  Requirement: 
  - firstName
  - lastName
  - currency
  - email 
  - country
  - password
  Response:
  - 200: 
    - message
    - token
  - 400:
    - message

- POST '/registeradmin'
  Requirement: 
  - firstName
  - lastName
  - email 
  - country
  - password
  Response:
  - 200: 
    - message
    - token
  - 400:
    - message

- POST '/login'
  Requirement: 
  - email 
  - password
  Response:
  - 200: 
    - message
    - token
  - 400:
    - message

- POST '/loginadmin'
  Requirement: 
  - email 
  - password
  Response:
  - 200: 
    - message
    - token
  - 400:
    - message

- POST '/credit': credit a user from external source like card or pament portal
  Requirement:
  - token
  - amount 
  - currency
  - name (sender name/company's id)
  Response:
  - 200:
    - message
    - amount
    - username
    - name
    - id
  - 500:
    - message
  - 400:
    - message

- POST '/fund': approve the credit by a user from external source like card or pament portal, done by admin
  Requirement:
  - token
  - amount
  - currency
  - name
  - email
  - id
  Response:
  - 200:
    - message
    - amount
    - username
    - sender
  - 400:
    - message

- POST '/send': send credit from a user to another user
  Requirement:
  - token
  - amount
  - name
  - email (recipient)
  - currency
  Response:
  - 200:
    - message
    - amount
    - username
    - sender
    - id
  - 400:
    - message

- POST '/sent': approve the transfer of credit between users, done by admin
  Requirement:
  - token
  - id (pending transaction id)
  Response:
  - 200:
    - message
    - amount
    - username
    - id
  - 400:
    - message

- POST '/debit': withdraw from wallet to external source or hard currency
  Requirement:
  - token
  - amount
  - currency
  Response:
  - 200:
    - message
    - amount
    - username
    - sender
    - id
  - 400:
    - message
  - 500:
    - message

- POST '/withdraw': approve the withdrawal of user, done by admin
  Requirement:
  - token
  - id (pending transaction id)
  Response:
  - 200:
    - message
    - amount
    - username
    - id
  - 400:
    - message

- POST '/addcurrency': add wallet for the user with anothr currency, only works for elite users and maximum of 4 wallets for the elite users.
  Requirement:
  - token
  - email
  Response:
  - 200:
    - message
    - currency
  - 400:
    - message

- POST '/changelevel': upgrade or downgrade users, done by admin
  Requirement:
  - token
  - level (the new level you want to upgrade the user to)
  - email
  Response:
  - 203:
    - message
  - 400:
    - message

- POST '/listtransactions/pending': List all pending transactions of all users ie transactions yet to be approved, done by admin.
  Requirement:
  - token
  Response:
  - 200:
    - data
  - 400:
    - message

- POST '/listtransactions/all': List all transactions of all users approved or not, done by admin.
  Requirement:
  - token
  Response:
  - 200:
    - data
  - 400:
    - message

- POST '/listtransactions/verified': List all verified transactions of all users, ie already approved transactions, done by admin.
  Requirement:
  - token
  Response:
  - 200:
    - data
  - 400:
    - message

- POST '/changecurrency': Change the main currency of user, done by admin.
  Requirement:
  - token
  - currency (new currency)
  - email
  Response:
  - 203:
    - message
  - 400:
    - message

- POST '/directfund': Directly fund a user without need for approval, done by admin.
  Requirement:
  - token
  - amount
  - currency
  - email
  Response:
  - 200:
    - message
    - amount
    - username
    - id
  - 400:
    - message
  - 500:
    - message

## Notes
Please note the follolwing
- Admin auth tokens are different from Users token
- We have two types of user Noob and Elite, Elite can carry out transaction in more than one currency exchange by having up to four wallets including the main one, Noob only possess one wallet and currency needs to be converted in case of multi currency transactions.