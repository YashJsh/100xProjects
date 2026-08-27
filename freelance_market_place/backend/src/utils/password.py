from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

def hash_password(password : str):
    hashed = password_hash.hash(password=password)
    return hashed


def check_password(password : str, hashed_password: str):
    check = password_hash.verify(password=password, hash=hashed_password)
    return check
