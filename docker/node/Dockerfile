FROM node:latest
WORKDIR /var/www/html

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install tcpdump
RUN apt-get -y install unzip
RUN apt-get -y install less
RUN apt-get -y install vim
RUN apt-get -y install figlet

# INSTALL MongoDB
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.4 main" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list
RUN apt-get update
RUN apt-get install -y mongodb-org
RUN mkdir -p /data/db
RUN echo "auth=true" >> /etc/mongod.conf
ENTRYPOINT /usr/bin/mongod
