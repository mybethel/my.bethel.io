angular.module('Bethel.util')
.service('upload', ['$upload', function ($upload) {

  /**
   * Upload the specified file to S3 using the $upload service.
   *
   * @param {object} destination S3 keys and bucket information.
   * @param {file} file The file object as selected by the user.
   */
  this.s3 = function(destination, file) {
    return $upload.upload({
      data: {
        acl: 'public-read',
        AWSAccessKeyId: destination.key,
        key: destination.bucket + '/' + file.name,
        policy: destination.policy,
        signature: destination.signature,
        'Content-Type': file.type !== '' ? file.type : 'application/octet-stream'
      },
      file: file,
      method: 'POST',
      url: destination.action
    });
  };

}]);