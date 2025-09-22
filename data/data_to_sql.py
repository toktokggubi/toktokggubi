import os
import glob
import pandas as pd
 
# The new, simplified categories you want to use
NEW_CATEGORIES = [
    '식비', '카페/간식', '술/유흥', '생활', '쇼핑', '뷰티/미용', '교통', '자동차', '의료/건강', '문화'
]

# A comprehensive mapping from the old categories to the new ones.
# Categories not in the new list are mapped to '기타' (Other).
CATEGORY_MAPPING = {
    # Direct Maps
    '식비': '식비',
    '카페/간식': '카페/간식',
    '술/유흥': '술/유흥',
    '뷰티/미용': '뷰티/미용',
    '교통': '교통',
    '자동차': '자동차',
    '의료/건강': '의료/건강',

    # Aggregated Maps
    '문화/여가': '문화',
    '여행/숙박': '문화',
    '교육/학습': '문화',

    '온라인쇼핑': '쇼핑',
    '패션/쇼핑': '쇼핑',

    '생활': '생활',
    '주거/통신': '생활',
    '반려동물': '생활',
    '자녀/육아': '생활',
    '경조/선물': '생활',

    # Categories to be grouped as '기타' (Other)
    # This includes financial transactions, income, and unclassified items.
    '보험': '기타',
    '대출': '기타',
    '이체': '기타',
    '카드대금': '기타',
    '급여': '기타',
    '사업수입': '기타',
    '용돈': '기타',
    '앱테크': '기타',
    '내계좌이체': '기타',
    '투자': '기타',
    '저축': '기타',
    '기타수입': '기타',
    '금융수입': '기타',
    '금융': '기타',
    '장학금': '기타',
    '현금': '기타',
    '아르바이트': '기타',
    '미분류': '기타',
}

def recategorize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies the new category mapping to the '대분류' column of a DataFrame.

    Args:
        df: The input DataFrame, which must contain a '대분류' column.

    Returns:
        A new DataFrame with the '대분류' column recategorized.
    """
    if '대분류' not in df.columns:
        print("Warning: '대분류' column not found in DataFrame. Skipping recategorization.")
        return df

    # Use .apply() with the mapping dictionary's .get() method.
    # This ensures that any category not in our mapping defaults to '기타'.
    df['대분류'] = df['대분류'].apply(lambda x: CATEGORY_MAPPING.get(x, '기타'))
    return df

if __name__ == '__main__':
    # Process all CSV files in the 'data' directory and save them to a new 'recategorized' directory.
    input_directory = 'data'
    output_directory = os.path.join('data', 'recategorized')

    # Create the output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)

    # Find all CSV files in the input directory
    csv_files = glob.glob(os.path.join(input_directory, '*.csv'))

    if not csv_files:
        print(f"No CSV files found in the '{input_directory}' directory.")
    else:
        print(f"Found {len(csv_files)} CSV file(s). Starting recategorization...")

        for filepath in csv_files:
            # This check is important to avoid trying to read directories as files
            if os.path.isdir(filepath):
                continue
            try:
                print(f"\n--- Processing: {filepath} ---")
                df = pd.read_csv(filepath)
                recategorized_df = recategorize_dataframe(df)

                # Construct the output path, placing the file in the new directory
                filename = os.path.basename(filepath)
                output_path = os.path.join(output_directory, filename)

                recategorized_df.to_csv(output_path, index=False, encoding='utf-8-sig')
                print(f"Successfully saved recategorized file to: {output_path}")
            except Exception as e:
                print(f"An error occurred while processing {filepath}: {e}")

        print("\nAll files processed.")
