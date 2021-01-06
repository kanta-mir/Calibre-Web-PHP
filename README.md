# Calibre-Web-PHP
## Official Website
http://calibre-web-php.mscod.net/

## About
Hallo dear users. You can make a website from your existing Calibre Library. It is PHP based and is very easy to setup and is extendable. It is only a rough try. I hope more experienced users will take it to another more professional level. Thanks

## Local PHP Dev Environment
You can easily setup a local php environment using Xampp - > https://www.apachefriends.org/index.html 

### Setup Caliber virtual path

You have to setup a virtual path to your calibre library on your hard disk if it is not in side xampp/htdocs folder.
1. Go to xampp/apache/conf and open httpd.conf in a text editor
2. Add following at the end 

Alias "/caliber" "e:/Calibre-Server-Books"

<Directory "e:/Calibre-Server-Books">

    #
    # Possible values for the Options directive are "None", "All",
    # or any combination of:
    #   Indexes Includes FollowSymLinks SymLinksifOwnerMatch ExecCGI MultiViews
    #
    # Note that "MultiViews" must be named *explicitly* --- "Options All"
    # doesn't give it to you.
    #
    # The Options directive is both complicated and important.  Please see
    # http://httpd.apache.org/docs/2.4/mod/core.html#options
    # for more information.
    #
    Options Indexes FollowSymLinks Includes ExecCGI

    #
    # AllowOverride controls what directives may be placed in .htaccess files.
    # It can be "All", "None", or any combination of the keywords:
    #   AllowOverride FileInfo AuthConfig Limit
    #
    AllowOverride All

    #
    # Controls who can get stuff from this server.
    #
    Require all granted
    
</Directory>

3. Note: replace the path as your calibre library location.
4. Now restart your apache server

## Calibre Database Location Setup
You can set the location of your existing calibre library in db-guru.php file on line 3

## File Types and Viewers
1. For PDF files PdfJs is used and there are two ways a pdf file can be viewed. It is very useful and many good functionalities and is also viewable on mobile browswers. 
2. For Djvu files there is also a djvu viewer.
3. For Comic Files i.e CBR and CBZ or Epub a very good Comic Reader Kthoom is used
4. For Docx & Text Files Google Docs Viewer is used. 

## Login
Username : admin
Password : pass

## About

If you want to contact me you can email me at kanta_mir@yahoo.com

Thanks
