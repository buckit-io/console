# Buckit Console

A graphical user interface for [Buckit](https://github.com/buckit-io/buckit)

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->

**Table of Contents**

- [Buckit Console](#buckit-console)
  - [Install](#install)
    - [Build from source](#build-from-source)
  - [Setup](#setup)
    - [1. Create a user `console` using `bm`](#1-create-a-user-console-using-bm)
    - [2. Create a policy for `console` with admin access to all resources (for testing)](#2-create-a-policy-for-console-with-admin-access-to-all-resources-for-testing)
    - [3. Set the policy for the new `console` user](#3-set-the-policy-for-the-new-console-user)
  - [Start Console service:](#start-console-service)
  - [Start Console service with TLS:](#start-console-service-with-tls)
  - [Connect Console to a Buckit deployment using TLS and a self-signed certificate](#connect-console-to-a-buckit-deployment-using-tls-and-a-self-signed-certificate)
- [Contribute to Buckit Console](#contribute-to-buckit-console)

<!-- markdown-toc end -->

Buckit Console provides a management and browser UI for Buckit object storage deployments.

## Setup

All `console` needs is a Buckit user with admin privileges and a URL pointing to your Buckit deployment.

> Note: We don't recommend using Buckit operator credentials.

### 1. Create a user `console` using `bm`

```bash
bm admin user add mybuckit console xxxxxxxx
```

### 2. Create a policy for `console` with admin access to all resources (for testing)

```sh
cat > admin.json << EOF
{
	"Version": "2012-10-17",
	"Statement": [{
			"Action": [
				"admin:*"
			],
			"Effect": "Allow",
			"Sid": ""
		},
		{
			"Action": [
                "s3:*"
			],
			"Effect": "Allow",
			"Resource": [
				"arn:aws:s3:::*"
			],
			"Sid": ""
		}
	]
}
EOF
```

```sh
bm admin policy create mybuckit consoleAdmin admin.json
```

### 3. Set the policy for the new `console` user

```sh
bm admin policy attach mybuckit consoleAdmin --user=console
```

> NOTE: Additionally, you can create policies to limit the privileges for other `console` users, for example, if you
> want the user to only have access to dashboard, buckets, notifications and watch page, the policy should look like
> this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["admin:ServerInfo"],
      "Effect": "Allow",
      "Sid": ""
    },
    {
      "Action": [
        "s3:ListenBucketNotification",
        "s3:PutBucketNotification",
        "s3:GetBucketNotification",
        "s3:ListMultipartUploadParts",
        "s3:ListBucketMultipartUploads",
        "s3:ListBucket",
        "s3:HeadBucket",
        "s3:GetObject",
        "s3:GetBucketLocation",
        "s3:AbortMultipartUpload",
        "s3:CreateBucket",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:DeleteBucket",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketPolicy"
      ],
      "Effect": "Allow",
      "Resource": ["arn:aws:s3:::*"],
      "Sid": ""
    }
  ]
}
```

## Start Console service:

Before running console service, following environment settings must be supplied

```sh
# Salt to encrypt JWT payload
export CONSOLE_PBKDF_PASSPHRASE=SECRET

# Required to encrypt JWT payload
export CONSOLE_PBKDF_SALT=SECRET

# Buckit endpoint
export CONSOLE_MINIO_SERVER=http://localhost:9000
```

Now start the console service.

```
./console server
INFO Serving console at http://localhost:9090
```

By default `console` runs on port `9090` this can be changed with `--port` of your choice.

## Start Console service with TLS:

Copy your `public.crt` and `private.key` to `~/.console/certs`, then:

```sh
./console server
INFO Serving console at http://[::]:9090
INFO Serving console at https://[::]:9443
```

For advanced users, `console` has support for multiple certificates to service clients through multiple domains.

Following tree structure is expected for supporting multiple domains:

```sh
 certs/
  │
  ├─ public.crt
  ├─ private.key
  │
  ├─ example.com/
  │   │
  │   ├─ public.crt
  │   └─ private.key
  └─ foobar.org/
     │
     ├─ public.crt
     └─ private.key
  ...

```

## Connect Console to a Buckit deployment using TLS and a self-signed certificate

Copy the Buckit `ca.crt` under `~/.console/certs/CAs`, then:

```sh
export CONSOLE_MINIO_SERVER=https://localhost:9000
./console server
```

You can verify that the apis work by doing the request on `localhost:9090/api/v1/...`

## Debug logging

In some cases it may be convenient to log all HTTP requests. This can be enabled by setting
the `CONSOLE_DEBUG_LOGLEVEL` environment variable to one of the following values:

- `0` (default) uses no logging.
- `1` log single line per request for server-side errors (status-code 5xx).
- `2` log single line per request for client-side and server-side errors (status-code 4xx/5xx).
- `3` log single line per request for all requests (status-code 4xx/5xx).
- `4` log details per request for server-side errors (status-code 5xx).
- `5` log details per request for client-side and server-side errors (status-code 4xx/5xx).
- `6` log details per request for all requests (status-code 4xx/5xx).

A single line logging has the following information:

- Remote endpoint (IP + port) of the request. Note that reverse proxies may hide the actual remote endpoint of the client's browser.
- HTTP method and URL
- Status code of the response (websocket connections are hijacked, so no response is shown)
- Duration of the request

The detailed logging also includes all request and response headers (if any).

# Contribute to Buckit Console

Please follow the [Contributor's Guide](https://github.com/buckit-io/console/blob/master/CONTRIBUTING.md).
