from flask import render_template, redirect, url_for, request, json
from app import app, freezer

import os

app.config['TEST_PROJECT_PATH'] = 'test-proj'
app.config['PROJECT_YEAR'] = '2017'

# Site paths
app.config['STAGING_PATH'] = ''
app.config['PRODUCTION_PATH'] = ''

# Category 
app.config['CATEGORY'] = 'Food'

# Publication date 
app.config['DATE'] = '2017-04-01'

# Hashtag
app.config['HASHTAG'] = ''



SITE_ROOT = os.path.realpath(os.path.dirname(__file__))

info = os.path.join(SITE_ROOT, "data", "info.sheet.json")
with open(info) as rest:
  restaurants = json.load(rest)

docs_info = os.path.join(SITE_ROOT, "data", "top_100_2017_digital_text.json")
with open(docs_info) as info:
  rinfo = json.load(info)
  text = rinfo['restaurants']

@app.route("/")
def index():
  return render_template('index.html')


@app.route('/<slug>/')
def restaurant_view(slug):
  
  restaurant_info = [x for x in restaurants if x['slug'] == slug]
  restaurant = restaurant_info[0]
  article = [y for y in text if y['slug'] == slug]

  return render_template(
    'restaurant.html',
    restaurant=restaurant,
    article=article
  )

@freezer.register_generator
def restaurant_view():
  for restaurant in restaurants:
    yield { 'slug': restaurant['slug']}
