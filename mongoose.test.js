var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nest', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  const UserSchema = new mongoose.Schema({
    username: String,
    password: {
      type: String,
      select: false,
    },
    seller: {
      type: Boolean,
      default: false,
    },
    address: {
      addr1: String,
      addr2: String,
      city: String,
      state: String,
      country: String,
      zip: Number,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  });
  const User = mongoose.model('User', UserSchema);
  User.findOne({ username: 'username' })
    .select('username password seller created')
    .lean()
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(doc);
      console.log({ func: doc.depopulate });
      db.close();
    });
});
