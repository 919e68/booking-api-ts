# Booking API

## Requirements

- docker
- docker-compose

## Commands

### Build

```bash
docker-compose build
```

### Start

```bash
docker-compose up
```

### GET Endpoint
`GET /bookings`

### POST Endpoint

`POST /bookings`
```json
{
  "serviceId": 1,
  "startTime": "2022-12-12T08:00:00.000Z",
  "endTime": "2022-12-12T08:09:59.000Z",
  "details": [
    {
      "email": "lorem@mail.com",
      "firstName": "Lorem",
      "lastName": "Ipsum"
    }
  ]
}
```
