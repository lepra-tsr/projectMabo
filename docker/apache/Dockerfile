FROM php:7-apache

WORKDIR /var/www/html

RUN docker-php-ext-install pdo_mysql mbstring
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install wget
RUN apt-get -y install unzip
RUN apt-get -y install less
RUN apt-get -y install vim
RUN apt-get -y install emacs
RUN rm -f /usr/local/apache2/htdocs/index.html
#COPY ./mabo.conf /etc/apache2/sites-available
#RUN cd /etc/apache2/sites-enabled && ln -s ../sites-available/mabo.conf