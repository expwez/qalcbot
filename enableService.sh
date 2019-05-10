#!/usr/bin/env bash

sudo cp qalcbot.service /etc/systemd/system
sudo systemctl enable --now qalcbot.service