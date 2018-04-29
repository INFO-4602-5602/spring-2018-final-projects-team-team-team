import pickle
import os

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
    - /data/{company}/{attribute}/{value}.csv:
    """
    for company in data.keys():
        company_path = os.path.join("data", company)

        if not os.path.exists(company_path):
            os.makedirs(company_path)

        for stat_type in data[company].keys():
            stat_type_path = os.path.join(company_path, stat_type)

            if not os.path.exists(stat_type_path):
                os.makedirs(stat_type_path)

            # get the stats we're gonna write
            random_date = list(data[company][stat_type].keys())[0]
            stats = list(data[company][stat_type][random_date].keys())

            # write each stat
            for stat in stats:
                stat_data = [("date","value")]

                for date in sorted(data[company][stat_type].keys()):
                    value = data[company][stat_type][date][stat]
                    stat_data.append((date, value))

                stat_path = os.path.join(stat_type_path, stat + ".csv")
                with open(stat_path, 'w') as f:
                    for line in stat_data:
                        f.write(f"{line[0]},{line[1]}\n")








            # keys = 

            # for stat in data[company]

            


    # print(data.keys())
    # print(data['msft'].keys())
    # print(data['msft']['MACD']['2016-02-02']['MACD'])
    # print(data['msft']['TIME_SERIES_DAILY_ADJUSTED']['2016-02-02'].keys())



if __name__ == '__main__':
    data = load_sp_data(fname='sp_data')
    write_data(data)
