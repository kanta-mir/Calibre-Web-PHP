# JSON Reading List (JRL) Files

kthoom supports loading in Reading Lists of books.  Think of a reading list as a playlist for your comic book reader.  It's a way to load in a bunch of comic book files at once.

Since I could not find any existing format for this, I created my own:  JSON Reading List files (.JRL).

The format is simple:

```json
{
  "items": [
    {"type": "book", "uri": "/foo/bar.cbz", "name": "Optional name"},
    {"type": "book", "uri": "http://example.com/foo/baz.cbr"}
  ]
}
```

  * The "uri" field must be a URI reference that points to a comic book file (.cbz, .cbr).
  * The "type" field must have the value "book".
  * The "name" field is optional and can be a short name for the comic book.

The JSON schema for the JRL file format is [here](https://codedread.github.io/kthoom/reading-lists/jrl-schema.json).

I created a simple web app to let you search for books and create reading lists: [jrlgen](https://github.com/codedread/jrlgen).
