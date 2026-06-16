#!/usr/bin/env bash

set -e

PORTFOLIO_DIR="portfolio"
OUTPUT_FILE="$PORTFOLIO_DIR/portfolio.json"

echo "{" > "$OUTPUT_FILE"

categories=("bridal" "editorial" "occasion")

for i in "${!categories[@]}"; do
    category="${categories[$i]}"

    echo "  \"$category\": [" >> "$OUTPUT_FILE"

    first=true

    find "$PORTFOLIO_DIR/$category" \
        -type f \
        \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) \
        | sort \
        | while read -r file; do

        relative="${file#portfolio/}"
        
        # ponytail: resize to 1000px max for performance and stable masonry calcs
        sips -Z 1000 "$file" > /dev/null 2>&1

        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$OUTPUT_FILE"
        fi

        printf '    "%s"' "$relative" >> "$OUTPUT_FILE"
    done

    echo "" >> "$OUTPUT_FILE"

    if [ "$i" -eq $((${#categories[@]} - 1)) ]; then
        echo "  ]" >> "$OUTPUT_FILE"
    else
        echo "  ]," >> "$OUTPUT_FILE"
    fi
done

echo "}" >> "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE"
