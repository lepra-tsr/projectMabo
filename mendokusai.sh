#!/usr/bin/env bash

# AWSにインスタンス立ててこれ突っ込んで叩く
# 別名手順書もしくは操作記録

sudo yum update -y && \
sudo yum install git -y

# nodejs
sudo yum install gcc-c++ make openssl-devel -y && \
git clone git://github.com/creationix/nvm.git .nvm && \
source ~/.nvm/nvm.sh && \
nvm install v6.11.1 && \
nvm use v6.11.1 && \
node -v

# ログイン後にnvmを有効化するため、.bash_profileに追記
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bash_profile
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'  >> ~/.bash_profile
nvm alias default v6.11.1

# mongodb
echo "[MongoDB]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64
gpgcheck=0
enabled=1" | sudo tee -a /etc/yum.repos.d/mongodb.repo && \
sudo yum install -y mongodb-org
sudo service mongod start

# mabo
git clone git://github.com/lepra-tsr/projectMabo.git ~/projectMabo
cd ~/projectMabo/src && \
npm install