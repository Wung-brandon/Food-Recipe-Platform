# Generated by Django 4.2.20 on 2025-05-19 18:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0004_alter_chefprofile_specialization_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="chefprofile",
            name="profile_picture",
            field=models.ImageField(blank=True, null=True, upload_to="chef/chef_pics/"),
        ),
    ]
