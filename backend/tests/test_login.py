import requests
import json

data = {
    "identifier": "jessiebryn.vasquez@csucc.edu.ph",
    "password": "password123" # assuming password123, or I can make a request without it... wait, what if I don't know the password?
}

# Actually, we can just use the DB to generate a token or directly inspect what is returned.
# Better yet, I can write a script to start a quick python block that calls `login` from auth.py directly
