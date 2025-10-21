---
layout: home
title: Computer Science
category: ComputerScience
permalink: /categories/computerscience/
---

<h1>{{ page.title }}</h1>

<ul>
{% for post in site.categories.ComputerScience %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%Y-%m-%d" }}
  </li>
{% endfor %}
</ul>