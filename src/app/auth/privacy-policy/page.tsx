"use client";
import React from "react";

import { Box, Paper, Typography } from "@mui/material";

import Logo from "@/components/logo/logo";

export default function Page() {
  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-fixed bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-240 max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex justify-start">
              <Logo classNameMobile="hidden" />
            </Box>

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  Privacy Policy
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  At AquaVista, we respect your privacy and are committed to protecting the personal and project data
                  you entrust to us. This Privacy Policy explains what information we collect, how we use it, and the
                  choices you have when using the AquaVista platform.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" className="mb-2">
                  1. Information We Collect
                </Typography>
                <Typography variant="body1">We may collect the following types of information:</Typography>
                <ul className="list-inside list-disc [&>li]:ms-2 [&>li:first-of-type]:mt-1">
                  <li>
                    Account Information: Your name, email address, organization or municipality, and role when you
                    register or are invited to a project
                  </li>
                  <li>
                    Project Data: Rate-study documents, spreadsheets, templates, dashboards, chat messages with AVA, and
                    other content you upload or create
                  </li>
                  <li>
                    Usage Data: Features accessed, pages visited, questions asked, actions taken, and diagnostic or
                    performance data
                  </li>
                  <li>
                    Device and Log Data: IP address, browser type, operating system, and timestamps associated with your
                    use of the platform
                  </li>
                  <li>Cookies and Tracking Technologies: Data used to maintain sessions and improve user experience</li>
                </ul>
                <br />

                <Typography variant="h6" className="mb-2">
                  2. How We Use Your Information
                </Typography>
                <Typography variant="body1">We use the information we collect to:</Typography>
                <ul className="list-inside list-disc [&>li]:ms-2 [&>li:first-of-type]:mt-1">
                  <li>Provide, operate, and maintain the AquaVista platform and services</li>
                  <li>Authenticate users and manage access to projects and data</li>
                  <li>Enable the AVA assistant to generate relevant, context-aware responses</li>
                  <li>Communicate with you about your account, updates, and support requests</li>
                  <li>Monitor usage, troubleshoot issues, and improve product features</li>
                  <li>Ensure security, enforce our Terms and Conditions, and comply with legal obligations</li>
                </ul>
                <br />

                <Typography variant="h6" className="mb-2">
                  3. AI Processing and Third-Party Providers
                </Typography>
                <Typography variant="body1">
                  AquaVista uses third-party AI and cloud providers to power AVA and host the platform. Data you provide
                  to AVA is processed to generate insights and responses. We do not allow these providers to use your
                  data to train their models, and we rely on providers who offer reasonable data protection commitments.
                  Any AI output should be reviewed by qualified professionals before being relied upon for official
                  decisions.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  4. Sharing Your Information
                </Typography>
                <Typography variant="body1">
                  We do not sell your personal information. We may share data in limited circumstances:
                </Typography>
                <ul className="list-inside list-disc [&>li]:ms-2 [&>li:first-of-type]:mt-1">
                  <li>With project collaborators and organization administrators as authorized by you or your admin</li>
                  <li>
                    With trusted service providers that help us operate the platform, such as hosting and email services
                  </li>
                  <li>With legal authorities when required by law, court order, or to protect our rights and users</li>
                  <li>
                    In connection with a merger, acquisition, or sale of assets, subject to confidentiality obligations
                  </li>
                </ul>
                <br />

                <Typography variant="h6" className="mb-2">
                  5. Cookies and Tracking Technologies
                </Typography>
                <Typography variant="body1">
                  AquaVista uses cookies and similar technologies to keep you signed in, remember preferences, and
                  understand how the platform is used. You can manage cookie settings through your browser, but
                  disabling cookies may affect the availability of certain features.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  6. Data Security
                </Typography>
                <Typography variant="body1">
                  We implement industry-standard technical and organizational measures to protect your information,
                  including encryption in transit and access controls. However, no electronic transmission or storage
                  system can be guaranteed 100% secure. You are responsible for keeping your account credentials safe
                  and promptly reporting any suspected unauthorized access.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  7. Your Rights and Choices
                </Typography>
                <Typography variant="body1">
                  Depending on your location, you may have the right to access, correct, restrict processing of, or
                  delete your personal data. You may also request an export of your data. To exercise these rights,
                  please contact us using the information below.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  8. Data Retention
                </Typography>
                <Typography variant="body1">
                  We retain your personal and project data for as long as your account is active or as needed to provide
                  the service, comply with legal obligations, resolve disputes, and enforce our agreements. You may
                  request deletion of your data at any time, subject to our legal and contractual retention
                  requirements.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  9. Children&apos;s Privacy
                </Typography>
                <Typography variant="body1">
                  AquaVista is not directed to children under the age of 16, and we do not knowingly collect personal
                  information from children. If you believe a child has provided us with personal data, please contact
                  us and we will take steps to delete it.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  10. Third-Party Links
                </Typography>
                <Typography variant="body1">
                  The platform may contain links to third-party websites or resources. We are not responsible for the
                  privacy practices or content of those third-party sites, and we encourage you to review their
                  policies.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  11. Updates to This Privacy Policy
                </Typography>
                <Typography variant="body1">
                  We may update this Privacy Policy from time to time. Changes will be posted on this page, and where
                  appropriate, we will notify you by email or through the platform. Your continued use of AquaVista
                  following the posting of changes constitutes acceptance of the updated policy.
                </Typography>
                <br />

                <Typography variant="h6" className="mb-2">
                  12. Contact Us
                </Typography>
                <Typography variant="body1">
                  If you have any questions about this Privacy Policy or how we handle your data, please reach out to us
                  at: support@aquavista.dev
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
