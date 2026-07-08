# Systemd service for Buckit Console

Systemd script for Buckit Console.

## Installation

- Systemd script is configured to run the binary from /usr/local/bin/.
- Systemd script is configured to run the binary as `console-user`, make sure you create this user prior using service script.
- Download the binary. Find the relevant links for the binary https://github.com/buckit-io/console#binary-releases.

## Create the Environment configuration file

This file serves as input to Buckit Console systemd service.

```sh
$ cat <<EOT >> /etc/default/console
# Special opts
CONSOLE_OPTS="--port 8443"

# salt to encrypt JWT payload
CONSOLE_PBKDF_PASSPHRASE=CHANGEME

# required to encrypt JWT payload
CONSOLE_PBKDF_SALT=CHANGEME

# Buckit endpoint
CONSOLE_MINIO_SERVER=http://buckit.endpoint:9000

EOT
```

## Systemctl

Copy `console.service` to `/etc/systemd/system/`

```
cp systemd/console.service /etc/systemd/system/console.service
```

Enable startup on boot

```
systemctl enable console.service
```

## Note

- Replace `User=console-user` and `Group=console-user` in `console.service`.
- Ensure that `CONSOLE_PBKDF_PASSPHRASE` and `CONSOLE_PBKDF_SALT` are set to appropriate values.
- Ensure that `CONSOLE_MINIO_SERVER` is set to appropriate server endpoint.
- Update `EnvironmentFile=` in `console.service` if you use a path other than `/etc/default/console`.
