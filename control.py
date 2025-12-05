import subprocess
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# Get commit data with lines changed
log = subprocess.check_output(
    "git log --all --date=short --pretty=format:'%ad' --numstat",
    shell=True
).decode().splitlines()

# Parse the data
commits = []
current_date = None

for line in log:
    line = line.strip()
    if not line:
        continue
    
    # Check if this is a date line (format: YYYY-MM-DD)
    if len(line) == 10 and line[4] == '-' and line[7] == '-':
        current_date = line
    elif current_date and '\t' in line:  # This is a numstat line
        parts = line.split('\t')
        if len(parts) >= 2:
            # Skip binary files (they show as '-')
            if parts[0] == '-' or parts[1] == '-':
                continue
            if parts[0].isdigit() and parts[1].isdigit():
                added = int(parts[0])
                deleted = int(parts[1])
                commits.append({
                    'date': current_date,
                    'lines': added + deleted
                })

# Create dataframe
df = pd.DataFrame(commits)
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

# Group by half-week periods (3.5 days)
# Calculate the number of half-weeks from the first commit
min_date = df['date'].min()
df['half_weeks_from_start'] = ((df['date'] - min_date).dt.total_seconds() / (3.5 * 24 * 3600)).astype(int)

# Aggregate by half-week
df_halfweek = df.groupby('half_weeks_from_start')['lines'].sum().reset_index()

# Create date range labels for each half-week period
df_halfweek['period_start'] = min_date + pd.to_timedelta(df_halfweek['half_weeks_from_start'] * 3.5, unit='D')
df_halfweek['period_end'] = df_halfweek['period_start'] + pd.Timedelta(days=3.5)
df_halfweek['date_range'] = df_halfweek['period_start'].dt.strftime('%m/%d') + ' - ' + df_halfweek['period_end'].dt.strftime('%m/%d')

# Create complete range of half-weeks
half_week_range = range(df_halfweek['half_weeks_from_start'].min(), 
                        df_halfweek['half_weeks_from_start'].max() + 1)
df_complete = pd.DataFrame({'half_weeks_from_start': half_week_range})
df_complete = df_complete.merge(df_halfweek, on='half_weeks_from_start', how='left')
df_complete['lines'] = df_complete['lines'].fillna(0)

# Fill in date ranges for periods with no commits
df_complete['period_start'] = min_date + pd.to_timedelta(df_complete['half_weeks_from_start'] * 3.5, unit='D')
df_complete['period_end'] = df_complete['period_start'] + pd.Timedelta(days=3.5)
df_complete['date_range'] = df_complete['period_start'].dt.strftime('%m/%d') + ' - ' + df_complete['period_end'].dt.strftime('%m/%d')

# Calculate control limits
mean = df_complete['lines'].mean()
std = df_complete['lines'].std()
ucl = mean + 3*std
lcl = max(0, mean - 3*std)  # Can't have negative lines

# Plot
plt.figure(figsize=(14, 6))
plt.plot(range(len(df_complete)), df_complete['lines'], marker='o', markersize=4)
plt.axhline(mean, color='green', linestyle='--', label=f'Mean ({mean:.0f} lines)')
plt.axhline(ucl, color='red', linestyle='--', label=f'UCL ({ucl:.0f} lines)')
plt.axhline(lcl, color='red', linestyle='--', label=f'LCL ({lcl:.0f} lines)')
plt.legend()
plt.title('Lines of Code Changed per Half-Week Period (Control Chart)')
plt.xlabel('Date Range (MM/DD - MM/DD)')
plt.ylabel('Lines of Code Changed')

# Set x-tick labels to date ranges, showing every nth label to avoid crowding
step = max(1, len(df_complete) // 20)  # Show approximately 20 labels
plt.xticks(range(0, len(df_complete), step), 
           df_complete['date_range'].iloc[::step], 
           rotation=45, 
           ha='right')

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()