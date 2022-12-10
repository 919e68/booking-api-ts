FROM node:18.12.1 as node-base

# env variables
ENV APP_SERVICE_PORT  "3000"
ENV APP_WORK_PATH     "/app"
ENV PATH              "$APP_WORK_PATH/node_modules/.bin:$PATH"


#########################
##     base builder     #
#########################
FROM node-base as builder-base

# set working directory
WORKDIR $APP_WORK_PATH

# install essentials

# install dependencies
COPY package.json ./
COPY yarn.lock    ./
RUN  yarn install --verbose

# copy app files
COPY . .


#########################
##     development     #
#########################
FROM builder-base as development

# set working directory
WORKDIR $APP_WORK_PATH

# expose app port
EXPOSE $APP_SERVICE_PORT

# start app
CMD yarn dev


#########################
##       production     #
#########################
FROM builder-base as production

# set working directory
WORKDIR $APP_WORK_PATH

# expose app port
EXPOSE $APP_SERVICE_PORT

# start app
CMD yarn start