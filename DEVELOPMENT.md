# Developing Buckit Console

The Buckit Console requires the [Buckit Server](https://github.com/buckit-io/buckit). For development purposes, you also need
to run both the Buckit Console web app and the Buckit Console server.

## Running Buckit Console server

Build the server in the main folder by running:

```
make
```

> Note: If it's the first time running the server, you might need to run `go mod tidy` to ensure you have all modules
> required.
> To start the server run:

```
CONSOLE_PBKDF_PASSPHRASE=<your-jwt-passphrase>
CONSOLE_PBKDF_SALT=<your-jwt-salt>
CONSOLE_MINIO_SERVER=<buckit-server-endpoint>
CONSOLE_DEV_MODE=on
./console server
```

## Running Buckit Console web app

Refer to `/web-app` [instructions](/web-app/README.md) to run the web app locally.

# Building with Buckit

To test console in its shipping format, you need to build it from the Buckit repository. The following steps will guide
you to do that.

### 0. Building with UI Changes

If you are performing changes in the UI components of console and want to test inside the BuckIt binary, you need to
build assets first.

In the console folder run

```shell
make assets
```

This will regenerate all the static assets that will be served by Buckit.

### 1. Clone the `Buckit` repository

In the parent folder of where you cloned this `console` repository, clone the Buckit repository.

```shell
git clone https://github.com/buckit-io/buckit.git
```

### 2. Update `go.mod` to use your local version

In the Buckit repository, open `go.mod` and after the first `require()` directive add a `replace()` directive.

```
...
)

replace (
github.com/buckit-io/console => "../console"
)

require (
...
```

### 3. Build `Buckit`

Still in the Buckit folder, run

```shell
make build
```

# LDAP authentication with Console

## Setup

Run openLDAP with docker.

```
$ docker run --rm -p 389:389 -p 636:636 --name my-openldap-container --detach osixia/openldap:1.3.0
```

Run the `billy.ldif` file using `ldapadd` command to create a new user and assign it to a group.

```
$ docker cp console/docs/ldap/billy.ldif my-openldap-container:/container/service/slapd/assets/test/billy.ldif
$ docker exec my-openldap-container ldapadd -x -D "cn=admin,dc=example,dc=org" -w admin -f /container/service/slapd/assets/test/billy.ldif -H ldap://localhost
```

Query the ldap server to check the user billy was created correctly and got assigned to the consoleAdmin group, you
should get a list
containing ldap users and groups.

```
$ docker exec my-openldap-container ldapsearch -x -H ldap://localhost -b dc=example,dc=org -D "cn=admin,dc=example,dc=org" -w admin
```

Query the ldap server again, this time filtering only for the user `billy`, you should see only 1 record.

```
$ docker exec my-openldap-container ldapsearch -x -H ldap://localhost -b uid=billy,dc=example,dc=org -D "cn=admin,dc=example,dc=org" -w admin
```

### Change the password for user billy

Set the new password for `billy` to `buckit123` and enter `admin` as the default `LDAP Password`

```
$ docker exec -it my-openldap-container /bin/bash
# ldappasswd -H ldap://localhost -x -D "cn=admin,dc=example,dc=org" -W -S "uid=billy,dc=example,dc=org"
New password:
Re-enter new password:
Enter LDAP Password:
```

### Add the consoleAdmin policy to user billy on Buckit

```
$ cat > consoleAdmin.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
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
$ bm admin policy create mybuckit consoleAdmin consoleAdmin.json
$ bm admin policy attach mybuckit consoleAdmin --user="uid=billy,dc=example,dc=org"
```

## Run Buckit

```
export MINIO_ACCESS_KEY=buckit
export MINIO_SECRET_KEY=buckit123
export MINIO_IDENTITY_LDAP_SERVER_ADDR='localhost:389'
export MINIO_IDENTITY_LDAP_USERNAME_FORMAT='uid=%s,dc=example,dc=org'
export MINIO_IDENTITY_LDAP_USERNAME_SEARCH_FILTER='(|(objectclass=posixAccount)(uid=%s))'
export MINIO_IDENTITY_LDAP_TLS_SKIP_VERIFY=on
export MINIO_IDENTITY_LDAP_SERVER_INSECURE=on
./buckit server ~/Data
```

## Run Console

```
export CONSOLE_LDAP_ENABLED=on
./console server
```
