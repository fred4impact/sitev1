from whitenoise.storage import CompressedManifestStaticFilesStorage


class SilentCollectStaticStorage(CompressedManifestStaticFilesStorage):
    """
    Third-party vendor bundles (e.g. jazzmin's bootstrap.min.js) sometimes
    reference a sourcemap file that isn't actually shipped. Django's default
    hashed_name() raises and aborts collectstatic entirely for a single
    missing reference; fall back to the unhashed name instead so the rest of
    the build still succeeds.
    """

    def hashed_name(self, name, content=None, filename=None):
        try:
            return super().hashed_name(name, content, filename)
        except ValueError:
            return name
