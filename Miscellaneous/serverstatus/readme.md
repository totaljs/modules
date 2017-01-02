# Server Status

## What is it?

Server Status is a monitoring module for Total.js framework. With this you can get real time traffic datas from your application. Developed by David Horvath (dacr at dacr dot hu). License: MIT.

## Install

Download **serverstatus.js** and copy it to **modules** folder in your application.

## Configuration

You can configure some parameters in **config** file of your application (in root directory of Total.js framework).

| Attributes                | Values                   | Default values | Descriptions                                                              |
| ------------------------- | ------------------------ |--------------- |-------------------------------------------------------------------------- |
| serverStatusUrl           | /anything                | /server-status |                                                                           |
| serverStatusCleanInterval | Integer                  | 1              | Cache cleanup interval in second (1 = request/sec, 30 = request/30sec). |
| serverStatusAllowedIPs    | ["IP-ADDR1", "IP-ADDR2"] |                | Block access to unconfigured IPs. Simple array.                           |
| serverStatusSecretKey     | random string            |                | You can limit the access with secret key.                                 |

**Example:**
```
serverStatusUrl                 : /myStatus
serverStatusCleanInterval       : 1
serverStatusAllowedIPs          : ["127.0.0.1"]
serverStatusSecretKey           : MY_SECRET_KEY
```

**serverStatusAllowedIPs** and **serverStatusSecretKey** can be used also  in combination.

##### Warning: If you not configure this two security attributes then status will be on display for everyone.

## Usage


**Get all data in JSON:**

http://yourapp:8000/server-status

**Use secret key:**

http://yourapp:8000/server-status?key=MY_SECRET_KEY

**Get one item in plaintext:**

http://yourapp:8000/server-status?item=request

http://yourapp:8000/server-status?key=MY_SECRET_KEY&item=PUT


**Sample output:**

```JSON
{
    "request": 0,
    "requestBegin": 0,
    "requestEnd": 0,
    "GET": 0,
    "POST": 0,
    "PUT": 0,
    "DELETE": 0,
    "uploadBegin": 0,
    "uploadEnd": 0,
    "websocket": 0,
    "websocketBegin": 0,
    "websocketEnd": 0,
    "numberOfIPs": 0
}
```

## Use with Zabbix

Download **zabbix** folder. In monitored server add this line to **zabbix_agentd.conf** (/etc/zabbix/):

```
#Total.js
UserParameter=totaljs.value[*], (curl -s "http://localhost:$1/server-status?key=MY_SECRET_KEY&item=$2")
```

In Zabbix webadmin import the **totaljs-server-status-template.xml** file and configure ports.

##### Note: This is a general template. You have to be configuration Zabbix.
