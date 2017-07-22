#!/bin/sh

npm run build
aws s3 rm s3://blairneumann-tipjar --recursive
aws s3 sync ./site s3://blairneumann-tipjar --acl public-read