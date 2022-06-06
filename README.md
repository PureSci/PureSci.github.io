
# Pures Useless Things

A bunch of script (only 1 actually).

## Avaliable Scripts
 - [**Discord Token Getter**](https://puresci.github.io/scripts/token_getter)
    - A script which lets you to get the token of a discord account.
## API Reference (server folder)

### Token Getter (Without Ticket)

```http
  POST /api/token_getter
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `response` | `string` | **Required**. hCaptcha response to discord.com/login |
| `mail` | `string` | **Required**. E-mail of the account you are trying to get the token of |
| `pass` | `string` | **Required**. Password of the account you are trying to get the token of |

#### Returns Either:
- Error
  ```json
  {
    error: true,
    errors:[]
  }
  ```
- Token
  ```json
  {
    token: "token"
  }
  ```
- 2FA Needed
  ```json
  {
    mfa: true,
    ticket: "ticket
  }
  ```
- Unknown
  ```json
  {
    unknown: "The response from discord, which is unknown"
  }
  ```

### Token Getter 2FA Response.

```http
  POST /api/token_getter
```


| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `ticket` | `string` | **Required**. Ticket given by discord to complete 2FA |
| `code` | `string` | **Required**. 2FA code |

#### Returns Either:
- Error
  ```json
  {
    message: "error message"
  }
  ```
- Token
  ```json
  {
    token: "token"
  }
  ```
- Unknown
  ```json
  {
    unknown: "The response from discord, which is unknown"
  }
  ```

