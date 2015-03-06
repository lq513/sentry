from __future__ import absolute_import

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.urlresolvers import reverse

from sentry.models import File, Release, ReleaseFile
from sentry.testutils import APITestCase


class ReleaseFilesListTest(APITestCase):
    def test_simple(self):
        project = self.create_project(name='foo')

        release = Release.objects.create(
            project=project,
            version='1',
        )

        releasefile = ReleaseFile.objects.create(
            project=project,
            release=release,
            file=File.objects.create(
                path='http://example.com',
                name='application.js',
                type='source',
            ),
            name='http://example.com/application.js'
        )

        url = reverse('sentry-api-0-release-files', kwargs={
            'project_id': project.id,
            'version': release.version,
        })

        self.login_as(user=self.user)

        response = self.client.get(url)

        assert response.status_code == 200, response.content
        assert len(response.data) == 1
        assert response.data[0]['id'] == str(releasefile.id)


class ReleaseFileCreateTest(APITestCase):
    def test_simple(self):
        project = self.create_project(name='foo')

        release = Release.objects.create(
            project=project,
            version='1',
        )

        url = reverse('sentry-api-0-release-files', kwargs={
            'project_id': project.id,
            'version': release.version,
        })

        self.login_as(user=self.user)

        response = self.client.post(url, {
            'name': 'http://example.com/application.js',
            'file': SimpleUploadedFile('application.js', 'function() { }',
                                       content_type='application/javascript'),
        }, format='multipart')

        assert response.status_code == 201, response.content

        releasefile = ReleaseFile.objects.get(release=release)
        assert releasefile.name == 'http://example.com/application.js'
        assert releasefile.file.headers == {
            'Content-Type': 'application/javascript',
        }
