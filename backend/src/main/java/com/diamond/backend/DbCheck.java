package com.diamond.backend;

import java.sql.*;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/booth_management";
        String user = "postgres";
        String password = "payal";
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getColumns(null, null, "voter_profiles", null);
            System.out.println("Columns in voter_profiles:");
            while (rs.next()) {
                System.out.println(rs.getString("COLUMN_NAME") + " (" + rs.getString("TYPE_NAME") + ")");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
