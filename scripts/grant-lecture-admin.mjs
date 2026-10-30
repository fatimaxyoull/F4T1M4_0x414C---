const email = process.argv[2]?.trim().toLowerCase();
const secretKey = process.env.CLERK_SECRET_KEY;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node scripts/grant-lecture-admin.mjs <verified-email>");
  process.exit(1);
}

if (!secretKey) {
  console.error("CLERK_SECRET_KEY is not configured in this environment.");
  process.exit(1);
}

const usersUrl = new URL("https://api.clerk.com/v1/users");
usersUrl.searchParams.append("email_address[]", email);
usersUrl.searchParams.set("limit", "10");

const lookup = await fetch(usersUrl, {
  headers: { Authorization: `Bearer ${secretKey}` },
});

if (!lookup.ok) {
  console.error(`Clerk account lookup failed (${lookup.status}).`);
  process.exit(1);
}

const users = await lookup.json();
const user = users.find((candidate) =>
  candidate.email_addresses?.some(
    (address) =>
      address.email_address?.toLowerCase() === email &&
      address.verification?.status === "verified",
  ),
);

if (!user) {
  console.error(
    "No verified account was found. Create the account, verify its email, and run this command again.",
  );
  process.exit(1);
}

if (user.public_metadata?.role === "admin") {
  console.log("The verified account already has administrator access.");
  process.exit(0);
}

const update = await fetch(
  `https://api.clerk.com/v1/users/${encodeURIComponent(user.id)}/metadata`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_metadata: {
        ...user.public_metadata,
        role: "admin",
      },
    }),
  },
);

if (!update.ok) {
  console.error(`Clerk role update failed (${update.status}).`);
  process.exit(1);
}

console.log("Administrator access was granted in the current Clerk environment.");
