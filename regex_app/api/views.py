from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import pandas as pd
import re
import io
import numpy as np

class FileUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file_obj = request.FILES['file']
        file_type = file_obj.name.split('.')[-1]
        pattern = request.data.get('pattern')
        replacement = request.data.get('replacement')
        column = request.data.get('column')

        try:
            if file_type in ['csv']:
                df = pd.read_csv(file_obj, encoding='utf-8', engine='python')
                print("DEBUG: CSV DataFrame:\n", df.head())
            elif file_type in ['xlsx', 'xls']:
                df = pd.read_excel(file_obj)
                print("DEBUG: Excel DataFrame:\n", df.head())
            else:
                return Response({'error': 'Unsupported file type'}, status=400)
        except Exception as e:
            return Response({'error': f"Error reading file: {str(e)}"}, status=400)

        # Normalize columns
        normalized_input = column.strip().lower().replace(" ", "")
        normalized_columns = [col.strip().lower().replace(" ", "") for col in df.columns]

        if normalized_input not in normalized_columns:
            return Response({'error': f"Column '{column}' not found. Available columns: {list(df.columns)}"}, status=400)

        actual_column = df.columns[normalized_columns.index(normalized_input)]

        try:
            regex_compiled = re.compile(pattern)
        except re.error as e:
            return Response({'error': f"Invalid regex pattern: {e}"}, status=400)

        def safe_convert(x):
            if pd.isna(x):
                return ''
            if isinstance(x, (int, float, np.integer, np.floating)):
                return str(int(x))
            return str(x)

        try:
            df[actual_column] = df[actual_column].apply(lambda x: regex_compiled.sub(replacement, safe_convert(x)))
        except Exception as e:
            return Response({'error': f"Error applying regex: {str(e)}"}, status=400)

        output = io.StringIO()
        df.to_csv(output, index=False)
        return Response({'data': output.getvalue()})



