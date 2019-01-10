# Peerbuds2.0

Under active development

Repository containing the Front End Angular App for The Blockchain University and Peerbuds website

## Project Structure

The repository has projects for 2 websites 
1. **The Blockchain University** in */projects/BlockchainU*
2. **Peerbuds** in */src*

## Documentation
The documentation has been created using compodoc. To generate the documentation and host it 
```
> npm run compodoc
> npm run compodoc-serve

```
This will serve the documentation on localhost:8080

## Project Setup instructions

1. To serve the angular app in development mode enter

For Blockchain University :
```
ng serve BlockchainU
```

For Peerbuds:
```
ng serve
```

2. To build the project files for deployement

For Blockchain University

```
sudo npm run build-blockchainu-low-mem
```
use *sudo* for ubuntu only


3. While deploying remove existing deployed files using
```
sudo rm -R /var/www/html/
```

4. And copy the new files from the dist folder using
```
sudo cp -a dist/BlockchainU/browser/. /var/www/html/
```

### Future enhancements
1. Write unit tests in all spec files.
2. Have test coverage of more than 80%.
3. Setup CI and CD.
4. Remove sidebar from */src/assets/menu* and refactor existing wizard code to be like *learning-path* wizard. 
5. Remove Shared Modules. Import all the necessary modules in the Feature modules seperately.
6. Refactor dialog services to only contain globally accessed dialogs. Feature dialogs should be moved to feature modules.
7. Implement prerendering/universal for public view pages only.
8. Make bundle size smaller for every requests.
9. After the test suites are setup and we have a test coverage of more than 80%, always keep angular up to date, and run tests.
10. Have better control over css.
   > The “assets” folder is only for images and fonts for example. Don’t put your global styles there, or when you’ll build your application, they will be added inside, it is not necessary.
   
   For more follow
   https://medium.com/@kmathy/angular-tips-and-tricks-for-css-structure-cb73fa50f0e8

11. Remove maximum external scripts from index.html and try to include everything directly into the feature using TS / ES6 imports, including in the modules so that tree-shaking is effective.

More improvements can be done bu following the best practices recomended in angular blog and angular-cli documentation.
