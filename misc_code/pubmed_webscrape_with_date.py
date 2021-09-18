# CS 171 Final Project, Web Scraping
# The hope of this file is to get an adjacency matrix of Harvard faculty co-authors
# perhaps keep track of count of times that two authors are on same paper
# feel free to ask Tyler Piazza about this file

import numpy as np
import pandas as pd
import re
import requests
from time import sleep
from bs4 import BeautifulSoup


def coauthors(faculty_name):
    """
    Find names of coauthors
    We might aim to get more structure, but for now, let's just get names
    -- this may artificially limit us to just the first 200 articles that show up
    example is from https://pubmed.ncbi.nlm.nih.gov/?term=Joanna+Aizenberg%5BAuthor%5D&format=pubmed&size=200

    Input faculty name like "Joanna+Aizenberg"
    """

    pubmed_url = f'https://pubmed.ncbi.nlm.nih.gov/?term={faculty_name}%5BAuthor%5D&format=pubmed&size=200'
    pubmed_page = requests.get(pubmed_url)
    if pubmed_page.status_code != 200:
        print(f"Uh oh, we have an error! Data did not load for {faculty_name}")
        return []
    else:
        print("Data successfully loaded")

    soup = BeautifulSoup(pubmed_page.text, "html.parser")

    # find the big blob of text
    pubmed_main_text = str(soup.find_all("pre", class_="search-results-chunk")[0])

    row_accumulator = []
    # identify a new blob for each paper
    paper_blobs = pubmed_main_text.split("PMID")[1:]

    authors = []
    for paper_blob in paper_blobs:
        #print(paper_blob)
        #print(pmid)
        # within each paper, identify the author
        author_blobs = paper_blob.split("FAU - ")[1:]
        # NOTE: you could also try to find "AU  - ", or "AD  - ", or something like it, to get author names (with middle initial, maybe) and school
        paper_authors = []
        for author_blob in author_blobs:
            # identify the author by going up to the \r
            author_name = author_blob.split("\r")[0]
            paper_authors.append(author_name)
        if len(paper_authors) > 0:

          # in each paper, save one-hot vector of which Harvard authors are here
          faculty_count_dict = {}
          for faculty_name in faculty_names:
            faculty_count_dict[faculty_name] = [0]

          #authors.append(paper_authors)
          # here, let's parse through these authors
          num_harvard_authors = 0
          for coauthor in paper_authors:
            try:
              first_name = coauthor.split(", ")[1].split(" ")[0]
              last_name = coauthor.split(",")[0]
              formatted_name = first_name + " " + last_name
              if formatted_name in first_last_dict:
                # record that this person was a coauthor
                faculty_count_dict[original_name_dict[formatted_name]] = [1]
                num_harvard_authors += 1
            except:
              # ex. if the name didn't have a comma, I couldn't split it using the method above
              print("some kind of formatting error at " + coauthor)

          paper_df = pd.DataFrame.from_dict(faculty_count_dict)
          paper_df["Harvard_Authors"] = num_harvard_authors
          paper_df["PMID"] = paper_blob.split("\r")[0].split(" ")[1]
          try:
            abstract = paper_blob.split("AB  - ")[1].split("\r\nFAU")[0]

          except:
            abstract = ""

          paper_df["Abstract"] = abstract

          try:
            title = paper_blob.split("TI  - ")[1].split("\r\n")[0]
          except:
            title = ""
          paper_df["Title"] = title
          try:
            dp = paper_blob.split("DP  - ")[1].split("\r")[0]

            if "-" in dp:
              dp = dp.split("-")[0]
            if len(dp.split(" ")) == 2:
              # just so we have a first of the month
              dp += " 1"
            elif len(dp.split(" ")) == 1:
              # if it just lists the year, put Jan 1
              dp += " Jan 1"
          except:
            dp = ""

          paper_df["DP"] = dp
          row_accumulator.append(paper_df)

    return row_accumulator


# deal with harvard faculty names
faculty_df = pd.read_excel('Visualization Data.xlsx',sheet_name="People")
faculty_names = list(faculty_df["Title"])
first_last_dict = {}
original_name_dict = {}
for faculty_name in faculty_names:
  # identify first and last names (roughly speaking)
  faculty_words = faculty_name.split(" ")
  first_name, last_name = faculty_words[0], faculty_words[-1]
  first_last_dict[first_name + " " + last_name] = True
  original_name_dict[first_name + " " + last_name] = faculty_name


def sanitize_coauthor_output(coauthor_list_of_lists):
  """
  this function aims to only keep Harvard faculty members (not other authors), and count how many times someone is a coauthor
  returns a DataFrame, which is one row
  """
  # faculty names are the only ones we care about
  # match on first/last name
  faculty_count_dict = {}
  for faculty_name in faculty_names:
    faculty_count_dict[faculty_name] = 0

  for coauthor_list in coauthor_list_of_lists:
    for coauthor in coauthor_list:
      try:
        first_name = coauthor.split(", ")[1].split(" ")[0]
        last_name = coauthor.split(",")[0]
        formatted_name = first_name + " " + last_name
        if formatted_name in first_last_dict:
          # keep track of how many times this person was coauthor
          faculty_count_dict[original_name_dict[formatted_name]] += 1
      except:
        # ex. if the name didn't have a comma, I couldn't split it using the method above
        print("some kind of formatting error at " + coauthor)

  # this is just a formatting nuisance, it can probably be avoided
  for name in faculty_count_dict:
    faculty_count_dict[name] = [faculty_count_dict[name]]
  return pd.DataFrame.from_dict(faculty_count_dict)

#print(coauthors("Joanna+Aizenberg"))

author_rows = []
faculty_indices = []
list_of_paper_rows = []
for i, faculty_name in enumerate(list(first_last_dict)):
  faculty_indices.append(original_name_dict[faculty_name])
  print(i)
  sleep(0.2)
  paper_rows = coauthors(faculty_name.split(" ")[0] + "+" + faculty_name.split(" ")[1])
  list_of_paper_rows += paper_rows


# then, make sure you don't have duplicates (you SHOULD have duplicates)
all_paper_rows = pd.concat(list_of_paper_rows, axis=0).sort_values(by="Harvard_Authors", ascending=False).reset_index(drop=True)
all_paper_rows = all_paper_rows[all_paper_rows["Harvard_Authors"] > 0].reset_index(drop=True)


# if there are duplicates, take the one that appears first, which happens
unique_paper_rows = all_paper_rows.drop_duplicates(subset="PMID", keep='first').sort_values(by="PMID").reset_index(drop=True)
unique_paper_rows.to_csv('per_paper_vals_v1.csv')


