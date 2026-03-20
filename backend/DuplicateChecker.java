import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class DuplicateChecker {
    public static void main(String[] args) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        File file = new File("src/main/resources/json/voters_demo.json");
        JsonNode root = mapper.readTree(file);

        Set<String> voterIds = new HashSet<>();
        Set<String> duplicates = new HashSet<>();

        for (JsonNode node : root) {
            String voterId = node.path("voterId").asText();
            if (!voterIds.add(voterId)) {
                duplicates.add(voterId);
            }
        }

        if (duplicates.isEmpty()) {
            System.out.println("No duplicate voterIds found.");
        } else {
            System.out.println("Duplicate voterIds found: " + duplicates);
        }
    }
}
