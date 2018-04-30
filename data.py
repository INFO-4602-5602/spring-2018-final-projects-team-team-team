import pickle
import os
import json
from collections import defaultdict

def load_sp_data(table=None, fname=None):
    """
    Helper function that loads the stock data stored in self.sp_data to a dict
    """
    if fname is None:
        with open('sp_data/' + str(table[0]) + '/' + str(table) + '.pkl', 'rb') as f:
            return pickle.load(f)
    else:
        with open('sp_data/' + fname + '.pkl', 'rb') as f:
            return pickle.load(f)


def write_data(data):
    """
    writes files in
    - /data/{company}/{stat_type}/{stat}.csv:
    """
    # write out the companies
    companies_path = os.path.join("data", "companies.json")
    companies = [c for c in list(data.keys()) if c != 'SECTOR']
    with open(companies_path, 'w') as f:
        f.write(json.dumps(companies))

    for company in companies:
        if company == 'SECTOR':
            continue

        company_path = os.path.join("data", company)

        if not os.path.exists(company_path):
            os.makedirs(company_path)

        # write the stat_types for the company
        company_stats_path = os.path.join(company_path, "stat_types.json")
        with open(company_stats_path, 'w') as f:
            f.write(json.dumps(list(data[company].keys())))

        for stat_type in data[company].keys():
            stat_type_path = os.path.join(company_path, stat_type)

            if not os.path.exists(stat_type_path):
                os.makedirs(stat_type_path)

            # get the stats we're gonna write
            random_date = list(data[company][stat_type].keys())[0]
            stats = list(data[company][stat_type][random_date].keys())

            # write the stats_list for the company_stat
            stats_list_path = os.path.join(stat_type_path, "stats_list.json")
            with open(stats_list_path, 'w') as f:
                f.write(json.dumps(stats));

            # write each stat
            for stat in stats:
                stat_base_path = os.path.join(stat_type_path, stat)
                # header
                stat_data = [("date","value")]

                date_info = defaultdict(lambda: defaultdict(list))

                # append stat datum sorted by date as (date, value) tuple
                for date in sorted(data[company][stat_type].keys()):
                    value = data[company][stat_type][date][stat]
                    stat_data.append((date, value))

                    year, month, day = date.split('-')

                    date_info[year][month].append(day)

                stat_path = stat_base_path + ".csv"
                with open(stat_path, 'w') as f:
                    for line in stat_data:
                        f.write(f"{line[0]},{line[1]}\n")

                # write the year information
                stat_years_path = f'{stat_base_path}_years.json'
                with open(stat_years_path, 'w') as f:
                    f.write(json.dumps(list(date_info.keys())));

                for year in date_info.keys():
                    stat_year_months_path = f'{stat_base_path}_{year}_months.json'

                    with open(stat_year_months_path, 'w') as f:
                        f.write(json.dumps(list(date_info[year].keys())));

                    for month in date_info[year].keys():
                        stat_year_month_days_path = f'{stat_base_path}_{year}_{month}_days.json'

                        with open(stat_year_month_days_path, 'w') as f:
                            f.write(json.dumps(list(date_info[year][month])));

if __name__ == '__main__':
    data = load_sp_data(fname='sp_data')
    write_data(data)
